import React, { useState, useEffect } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaFire,
  FaStar,
  FaBriefcase,
  FaDollarSign,
  FaCode,
  FaReact,
  FaVuejs,
  FaAngular,
  FaNodeJs,
  FaPython,
  FaDocker,
} from "react-icons/fa";
import {
  SiTypescript,
  SiRust,
  SiGo,
  SiKubernetes,
  SiNextdotjs,
  SiTailwindcss,
} from "react-icons/si";

const TechTrends = () => {
  const [githubTrending, setGithubTrending] = useState([]);
  const [stackOverflowTrends, setStackOverflowTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("rising"); // rising, declining, stable

  // Icon mapping
  const iconMap = {
    React: { icon: FaReact, color: "text-cyan-400" },
    TypeScript: { icon: SiTypescript, color: "text-blue-400" },
    "Next.js": { icon: SiNextdotjs, color: "text-emerald-400" },
    Rust: { icon: SiRust, color: "text-orange-400" },
    Go: { icon: SiGo, color: "text-cyan-400" },
    Tailwind: { icon: SiTailwindcss, color: "text-teal-400" },
    Python: { icon: FaPython, color: "text-yellow-400" },
    Docker: { icon: FaDocker, color: "text-blue-400" },
    Kubernetes: { icon: SiKubernetes, color: "text-indigo-400" },
    Vue: { icon: FaVuejs, color: "text-green-400" },
    Angular: { icon: FaAngular, color: "text-red-400" },
    "Node.js": { icon: FaNodeJs, color: "text-green-400" },
  };

  // Static curated data with growth trends
  const curatedTechs = [
    {
      name: "React",
      trend: "rising",
      change: 15.4,
      jobs: 1245,
      salary: 120,
      monthlyGrowth: [82, 85, 88, 89, 91, 94],
      popularity: 94,
    },
    {
      name: "TypeScript",
      trend: "rising",
      change: 28.7,
      jobs: 980,
      salary: 135,
      monthlyGrowth: [65, 72, 78, 82, 88, 95],
      popularity: 95,
    },
    {
      name: "Next.js",
      trend: "rising",
      change: 42.3,
      jobs: 856,
      salary: 125,
      monthlyGrowth: [45, 55, 65, 75, 85, 98],
      popularity: 98,
    },
    {
      name: "Rust",
      trend: "rising",
      change: 35.2,
      jobs: 567,
      salary: 145,
      monthlyGrowth: [38, 45, 55, 65, 75, 85],
      popularity: 85,
    },
    {
      name: "Tailwind",
      trend: "rising",
      change: 52.1,
      jobs: 1120,
      salary: 110,
      monthlyGrowth: [35, 48, 62, 75, 88, 96],
      popularity: 96,
    },
    {
      name: "Angular",
      trend: "declining",
      change: -8.4,
      jobs: 534,
      salary: 118,
      monthlyGrowth: [78, 75, 72, 68, 64, 58],
      popularity: 58,
    },
    {
      name: "Vue",
      trend: "stable",
      change: 2.1,
      jobs: 678,
      salary: 115,
      monthlyGrowth: [68, 69, 70, 69, 70, 70],
      popularity: 70,
    },
    {
      name: "Docker",
      trend: "rising",
      change: 12.6,
      jobs: 1340,
      salary: 140,
      monthlyGrowth: [75, 78, 82, 85, 88, 90],
      popularity: 90,
    },
  ];

  useEffect(() => {
    fetchGithubTrending();
    fetchStackOverflowData();
  }, []);

  const fetchGithubTrending = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/search/repositories?q=stars:>50000&sort=stars&order=desc&per_page=10"
      );
      const data = await response.json();
      setGithubTrending(data.items || []);
    } catch (error) {
      console.error("GitHub API Error:", error);
    }
  };

  const fetchStackOverflowData = async () => {
    try {
      // StackOverflow Tags API
      const response = await fetch(
        "https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=10"
      );
      const data = await response.json();
      setStackOverflowTrends(data.items || []);
      setLoading(false);
    } catch (error) {
      console.error("StackOverflow API Error:", error);
      setLoading(false);
    }
  };

  // Sparkline Chart Component
  const SparklineChart = ({ data, trend }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    const gradientId = `gradient-${Math.random()}`;
    const color =
      trend === "rising"
        ? "#10b981"
        : trend === "declining"
        ? "#ef4444"
        : "#eab308";

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-12"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Circular Progress Bar
  const CircularProgress = ({ percentage, size = 80 }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f2937"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="progressGradient">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

  const filteredTechs = curatedTechs.filter((tech) => {
    if (activeView === "all") return true;
    return tech.trend === activeView;
  });

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30">
        <div className="container mx-auto px-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl px-6 py-3 rounded-full border border-emerald-500/30 mb-6">
            <FaFire className="text-emerald-400 text-2xl animate-pulse" />
            <span className="text-emerald-400 font-bold">LIVE TRENDS 2025</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-4">
            Technology Trends
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-time insights powered by GitHub & Stack Overflow
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <FaArrowUp className="text-emerald-400 text-2xl" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">
                  {curatedTechs.filter((t) => t.trend === "rising").length}
                </p>
                <p className="text-sm text-gray-400">Rising</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <FaBriefcase className="text-yellow-400 text-2xl" />
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">
                  {curatedTechs
                    .reduce((sum, t) => sum + t.jobs, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <FaDollarSign className="text-teal-400 text-2xl" />
              </div>
              <div>
                <p className="text-3xl font-bold text-teal-400">$128k</p>
                <p className="text-sm text-gray-400">Avg Salary</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 hover:scale-105 transition-transform">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <FaStar className="text-cyan-400 text-2xl" />
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-400">
                  {githubTrending.length}
                </p>
                <p className="text-sm text-gray-400">Trending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {[
            { key: "rising", label: "🚀 Rising", color: "emerald" },
            { key: "stable", label: "━ Stable", color: "yellow" },
            { key: "declining", label: "↓ Declining", color: "red" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeView === key
                  ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/50 scale-110`
                  : "bg-slate-800/60 text-gray-400 hover:bg-slate-700/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Technology Cards with Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredTechs.map((tech, index) => {
            const IconData = iconMap[tech.name] || {
              icon: FaCode,
              color: "text-gray-400",
            };
            const Icon = IconData.icon;

            return (
              <div
                key={index}
                className="group bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-400/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                {/* Icon & Trend */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 bg-slate-900/60 rounded-xl ${IconData.color}`}
                  >
                    <Icon className="text-3xl" />
                  </div>
                  <div className="flex items-center gap-2">
                    {tech.trend === "rising" && (
                      <FaArrowUp className="text-emerald-400 text-xl" />
                    )}
                    {tech.trend === "declining" && (
                      <FaArrowDown className="text-red-400 text-xl" />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        tech.trend === "rising"
                          ? "text-emerald-400"
                          : tech.trend === "declining"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {tech.change > 0 ? "+" : ""}
                      {tech.change}%
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  {tech.name}
                </h3>

                {/* Sparkline */}
                <div className="mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <SparklineChart
                    data={tech.monthlyGrowth}
                    trend={tech.trend}
                  />
                </div>

                {/* Popularity Circle */}
                <div className="flex items-center justify-center mb-4">
                  <CircularProgress percentage={tech.popularity} size={70} />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Jobs</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {tech.jobs}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Salary</p>
                    <p className="text-lg font-bold text-teal-400">
                      ${tech.salary}k
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* GitHub Trending Section */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-6">
            <FaChartLine className="text-emerald-400 text-3xl" />
            <h3 className="text-3xl font-bold text-white">
              GitHub Trending Repositories
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {githubTrending.slice(0, 5).map((repo, index) => (
              <div
                key={index}
                className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all hover:scale-105"
              >
                <p className="text-white font-bold text-sm mb-2 truncate">
                  {repo.name}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <FaStar /> {(repo.stargazers_count / 1000).toFixed(1)}k
                  </span>
                  <span className="text-gray-500">{repo.language}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30">
            <h3 className="text-3xl font-bold text-white mb-4">
              Master These Technologies
            </h3>
            <p className="text-gray-400 mb-6 max-w-xl">
              Join our platform and work on real projects using the hottest tech
              stack
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-110">
              Start Learning Now →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechTrends;
