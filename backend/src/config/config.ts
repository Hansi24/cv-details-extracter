import dotenv from 'dotenv';

dotenv.config();

interface Config {
    DB_URI: string;
    PORT: number;
    APP_PASSWORD: string;
    EMAIL: string;
    S3BucketURl: string;
    CandidateEmail: string;
}

const config: Config = {
    DB_URI: process.env.DB_URI || 'mongodb://127.0.0.1:27017/jobApplication',
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 5001,
    EMAIL: process.env.EMAIL || 'jfinder424@gmail.com',
    APP_PASSWORD: process.env.APP_PASSWORD || 'okgxzqkasemfrhhx',
    S3BucketURl: process.env.S3BucketURl || 'https://cvdrivebucket.s3.us-east-1.amazonaws.com/',
    CandidateEmail: process.env.CandidateEmail || 'hansisewwandi0824@gmail.com',
};

export { config };
