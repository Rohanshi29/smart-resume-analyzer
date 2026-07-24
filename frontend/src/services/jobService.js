import api from "../api/axios";

export const getJobs = () =>
  api.get("jobs/");