import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

const FreelancerRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    skills: [""],
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
    resume: null,
  });

  const handleChange = (data) => {
    setFormData({ ...formData, ...data });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/freelancers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Registration successful!");
      } else {
        console.error("Backend error:", result);
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-100 p-10">
        {/* Stepper */}
        <div className="flex justify-center mb-10">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`flex items-center mx-2`}>
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-200
                  ${
                    step === num
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-110"
                      : "bg-green-100 text-green-700"
                  }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div className="w-10 h-1 bg-green-200 mx-1 rounded"></div>
              )}
            </div>
          ))}
        </div>
        {/* Step Content */}
        <div>
          {step === 1 && (
            <Step1 nextStep={nextStep} handleChange={handleChange} />
          )}
          {step === 2 && (
            <Step2
              nextStep={nextStep}
              prevStep={prevStep}
              handleChange={handleChange}
            />
          )}
          {step === 3 && (
            <Step3
              prevStep={prevStep}
              handleChange={handleChange}
              nextStep={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerRegistration;
