import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

type FormData = {
  name: string;
  email: string;
  phone: string;
  cv: FileList;
};

const JobApplicationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data: FormData) => {
    if (!data.cv.length) return alert("Please upload a CV");

    const file = data.cv[0];
    setUploading(true);
    setMessage("Submitting metadata...");

    try {
      const response = await axios.post(
        "https://cv-details-extracter.onrender.com/api/add/application",
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
        }
      );

      if (response.data.success) {
        const applicationId = response.data.data._id;

        setMessage("Requesting upload URL...");
        const responseFromAws = await axios.post(
          "https://3h56funjd3.execute-api.us-east-1.amazonaws.com/getSignUrl",
          {
            contentType: file.type,
            applicationId: applicationId,
            callbackUrl: "https://cv-details-extracter.onrender.com/api/update/application",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(responseFromAws);

        if (responseFromAws.data.statusCode === 200) {
          const { uploadUrl } = responseFromAws.data.body;
          setMessage("Uploading CV...");
          await axios.put(uploadUrl, file, {
            headers: { "Content-Type": file.type },
          });
          setMessage("Application submitted successfully!");
          reset();
        }
      }
      console.log(response);
    } catch (error) {
      console.error(error);
      setMessage("Error processing your application.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Job Application Form
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full border rounded p-2"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full border rounded p-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="tel"
              {...register("phone", { required: "Phone number is required" })}
              className="w-full border rounded p-2"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Upload CV (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              {...register("cv", { required: "CV is required" })}
              className="w-full border rounded p-2"
            />
            {errors.cv && (
              <p className="text-red-500 text-sm">{errors.cv.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? "Processing..." : "Submit Application"}
          </button>
        </form>

        {message && <p className="text-center mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default JobApplicationForm;
