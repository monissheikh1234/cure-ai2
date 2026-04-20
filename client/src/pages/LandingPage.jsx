import { useNavigate } from "react-router-dom";
import { FeatureCard } from "../components/FeatureCard.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToRoleHome = () => {
    if (!user) navigate("/login");
    else if (user.role === "doctor") navigate("/doctor");
    else navigate("/patient");
  };

  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            AI-powered healthcare monitoring and visualization.
          </h1>
          <p className="text-sm md:text-base text-slate-300 mb-5 max-w-xl">
            CureAI connects doctors and patients through secure records, AI-driven report
            summaries, and an interactive 3D body viewer for intuitive understanding of
            diseases.
          </p>
          <div className="flex gap-3">
            <button onClick={goToRoleHome} className="btn-primary">
              Get started
            </button>
            <button
              onClick={() => navigate("/visualization")}
              className="btn-ghost"
            >
              View 3D Health Model
            </button>
          </div>
        </div>
        <div className="card-glass p-5 text-sm text-slate-200 space-y-2">
          <div className="text-xs font-mono text-emerald-400/80">Real-time benefits</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Search patients instantly via Aadhaar number.</li>
            <li>Upload PDF or image reports and let AI summarize them.</li>
            <li>Visualize affected organs on an interactive 3D body.</li>
            <li>Redirect to an external AI Fitness Monitor for posture tracking.</li>
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        <FeatureCard
          title="Patient Records"
          description="Securely manage patient demographics, diseases and medications, with Aadhaar-based lookup for doctors."
          actionLabel="Open records"
          onClick={goToRoleHome}
        />
        <FeatureCard
          title="AI Medical Report Analysis"
          description="Upload lab reports and discharge summaries; Gemini generates summaries, explanations and recommendations."
          actionLabel="Upload report"
          onClick={() => navigate("/upload")}
        />
        <FeatureCard
          title="3D Health Visualization"
          description="View a 3D human model with highlighted organs based on the patient's recorded diseases."
          actionLabel="Launch viewer"
          onClick={() => navigate("/visualization")}
        />
        <FeatureCard
          title="AI Fitness Monitor"
          description="Deep-link into your existing AI-powered posture and exercise monitoring system."
          actionLabel="Start AI Exercise Monitoring"
          onClick={() => {
            window.open("http://127.0.0.1:5000/", "_blank", "noopener,noreferrer");
          }}
        />
      </section>
    </div>
  );
}

