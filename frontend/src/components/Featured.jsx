import React from "react";
import {
  FaCode,
  FaPaintBrush,
  FaCamera,
  FaPenNib,
  FaMobile,
  FaBullhorn,
} from "react-icons/fa";

const Featured = () => {
  const categories = [
    {
      icon: "FaCode",
      title: "Web Development",
      description: "Full-stack development, APIs, and modern frameworks",
      jobs: 245,
      color: "from-emerald-400 to-teal-600",
      bgColor: "from-emerald-400/20 to-teal-600/20",
    },
    {
      icon: "FaPaintBrush",
      title: "Graphic Design",
      description: "Logo design, branding, and visual identity",
      jobs: 189,
      color: "from-teal-400 to-lime-600",
      bgColor: "from-teal-400/20 to-lime-600/20",
    },
    {
      icon: "FaCamera",
      title: "Photography",
      description: "Product photography, events, and editing",
      jobs: 156,
      color: "from-lime-400 to-emerald-600",
      bgColor: "from-lime-400/20 to-emerald-600/20",
    },
    {
      icon: "FaPenNib",
      title: "Content Writing",
      description: "Blog posts, copywriting, and SEO content",
      jobs: 203,
      color: "from-emerald-400 to-lime-500",
      bgColor: "from-emerald-400/20 to-lime-500/20",
    },
    {
      icon: "FaMobile",
      title: "Mobile Development",
      description: "iOS, Android, and cross-platform apps",
      jobs: 167,
      color: "from-teal-400 to-emerald-500",
      bgColor: "from-teal-400/20 to-emerald-500/20",
    },
    {
      icon: "FaBullhorn",
      title: "Digital Marketing",
      description: "SEO, social media, and online advertising",
      jobs: 134,
      color: "from-lime-400 to-teal-500",
      bgColor: "from-lime-400/20 to-teal-500/20",
    },
  ];

  const iconMap = {
    FaCode,
    FaPaintBrush,
    FaCamera,
    FaPenNib,
    FaMobile,
    FaBullhorn,
  };

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900/30 overflow-hidden">
      {}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-200 mb-6">
            Popular Categories
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Explore thousands of jobs across different categories and find the
            perfect match for your skills
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon];
            return (
              <div
                key={index}
                className="group bg-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 p-8 border border-emerald-500/20 hover:border-emerald-400/40 hover:-translate-y-3 hover:scale-105 cursor-pointer"
              >
                <div
                  className={`bg-gradient-to-r ${category.bgColor} w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-emerald-500/20`}
                >
                  <IconComponent className="text-white text-3xl" />
                </div>

                <h3 className="text-2xl font-bold text-gray-200 mb-4 group-hover:text-emerald-400 transition-colors duration-300">
                  {category.title}
                </h3>

                <p className="text-gray-400 mb-6 leading-relaxed">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-full border border-emerald-500/20">
                    {category.jobs} jobs available
                  </span>
                  <button className="text-emerald-400 hover:text-lime-400 font-semibold text-sm group-hover:translate-x-2 transition-all duration-300 flex items-center gap-2">
                    View Jobs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div className="text-center mt-20">
          <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-lime-400 text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-105 border border-emerald-500/30">
            <span className="flex items-center gap-3">
              View All Categories
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Featured;
