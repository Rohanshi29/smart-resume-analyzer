import { useState } from "react";

function AddJob() {
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    description: "",
  });

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(job);

    alert("Job Added Successfully!");

    setJob({
      title: "",
      company: "",
      location: "",
      skills: "",
      description: "",
    });
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Add New Job</h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={job.title}
              onChange={handleChange}
              placeholder="Enter Job Title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-control"
              name="company"
              value={job.company}
              onChange={handleChange}
              placeholder="Enter Company Name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={job.location}
              onChange={handleChange}
              placeholder="Enter Job Location"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Required Skills</label>
            <input
              type="text"
              className="form-control"
              name="skills"
              value={job.skills}
              onChange={handleChange}
              placeholder="Example: Python, Django, React"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Job Description</label>
            <textarea
              className="form-control"
              rows="4"
              name="description"
              value={job.description}
              onChange={handleChange}
              placeholder="Enter Job Description"
              required
            ></textarea>
          </div>

          <button className="btn btn-success w-100">
            Add Job
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddJob;