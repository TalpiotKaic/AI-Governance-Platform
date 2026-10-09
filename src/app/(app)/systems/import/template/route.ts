// GET /systems/import/template?l=<locale> — same handler as /api/systems/template, served under the page path so
// deployments whose reverse proxy routes /api/* elsewhere still get the file.
export { GET } from "@/app/api/systems/template/route";
