
import type { JobListing } from '../types';

const mockJobs: JobListing[] = [
  {
    title: 'Senior Frontend Developer (React)',
    company: 'TechSolutions ZA',
    location: 'Cape Town, Western Cape',
    description: 'Join our innovative team to build cutting-edge web applications using React and TypeScript. 5+ years of experience required.',
    url: '#',
  },
  {
    title: 'Junior Software Engineer (Python)',
    company: 'Data Insights Pty Ltd',
    location: 'Johannesburg, Gauteng',
    description: 'An exciting opportunity for a recent graduate to work on data processing pipelines and machine learning models.',
    url: '#',
  },
  {
    title: 'UX/UI Designer',
    company: 'CreativeWeb',
    location: 'Durban, KwaZulu-Natal',
    description: 'We are looking for a talented designer to create amazing user experiences. A strong portfolio is a must.',
    url: '#',
  },
  {
    title: 'Digital Marketing Specialist',
    company: 'MarketPro',
    location: 'Cape Town, Western Cape',
    description: 'Drive our digital marketing campaigns across various channels. Experience with SEO, SEM, and social media is essential.',
    url: '#',
  },
  {
    title: 'Cloud Engineer (AWS)',
    company: 'InfraCloud SA',
    location: 'Remote',
    description: 'Manage and scale our cloud infrastructure on AWS. Strong knowledge of EC2, S3, and Lambda is required.',
    url: '#',
  },
  {
    title: 'Customer Support Representative',
    company: 'HelpDesk Heroes',
    location: 'Johannesburg, Gauteng',
    description: 'Provide top-notch support to our customers. Excellent communication skills and a friendly attitude are key.',
    url: '#',
  },
  {
    title: 'Project Manager',
    company: 'BuildIt Right',
    location: 'Pretoria, Gauteng',
    description: 'Lead our construction projects from start to finish. A degree in civil engineering or a related field is preferred.',
    url: '#',
  },
  {
    title: 'Data Analyst',
    company: 'NumberCrunchers',
    location: 'Cape Town, Western Cape',
    description: 'Analyze large datasets to provide actionable insights. Proficiency in SQL and data visualization tools is required.',
    url: '#',
  },
];

// This function simulates calling a job board API
export const findJobs = (
  query?: string,
  location?: string,
  job_type?: string
): JobListing[] => {
  console.log(
    `Searching for jobs with query: ${query}, location: ${location}, type: ${job_type}`
  );

  let results = [...mockJobs];

  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    results = results.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerCaseQuery) ||
        job.description.toLowerCase().includes(lowerCaseQuery)
    );
  }

  if (location) {
    const lowerCaseLocation = location.toLowerCase();
    results = results.filter((job) =>
      job.location.toLowerCase().includes(lowerCaseLocation)
    );
  }

  // The job_type parameter is included for the tool definition but not used in this mock filter.
  // To make it feel more dynamic, we'll randomize and limit the results.
  return results.sort(() => 0.5 - Math.random()).slice(0, 5);
};
