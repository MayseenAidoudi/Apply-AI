import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

type ProfileForm = {
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  skills: string[];
  experiences: {
    jobTitle: string;
    company: string;
    duration: string;
    responsibilities: string;
  }[];
  educations: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    yearGraduated: string;
  }[];
  certifications: {
    title: string;
    issuingOrganization: string;
    dateIssued: string;
  }[];
  portfolio: string;
};

const OnboardingForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: "",
      contactInfo: { email: "", phone: "", linkedin: "", github: "" },
      skills: [],
      experiences: [],
      educations: [],
      certifications: [],
      portfolio: "",
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experiences",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "educations",
  });

  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    duration: "",
    responsibilities: "",
  });

  const [newEducation, setNewEducation] = useState({
    degree: "",
    fieldOfStudy: "",
    institution: "",
    yearGraduated: "",
  });


  const [currentStep, setCurrentStep] = useState(0);
  const steps = 3;

  const [skills, setSkills] = useState<string[]>([]);

  const onSubmit = (data: ProfileForm) => {
    console.log(JSON.stringify({ ...data, skills }, null, 2));
  };

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills((prev) => [...prev, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };


  const handleAddExperience = () => {
    if (newExperience.jobTitle && newExperience.company) {
      appendExperience(newExperience);
      setNewExperience({
        jobTitle: "",
        company: "",
        duration: "",
        responsibilities: "",
      });
    }
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      appendEducation(newEducation);
      setNewEducation({
        degree: "",
        fieldOfStudy: "",
        institution: "",
        yearGraduated: "",
      });
    }
  };
  return (
    <Card className="bg-gray-900 border-gray-800 w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="text-2xl font-bold text-white">
            Apply<span className="text-indigo-500">.tn</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-white">
          Onboarding Form
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Fill out your details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Step Indicators */}
          <div className="flex justify-between mb-4">
            {Array.from({ length: steps }).map((_, index) => (
              <div
                key={index}
                className={`w-1/3 h-2 transition-all ${
                  currentStep >= index ? "bg-indigo-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Personal Information and Contact */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Your Name"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    )}
                  />
                  {errors.name && (
                    <span className="text-red-500">{errors.name.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Controller
                    name="contactInfo.email"
                    control={control}
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    )}
                  />
                  {errors.contactInfo?.email && (
                    <span className="text-red-500">
                      {errors.contactInfo.email.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Phone
                  </label>
                  <Controller
                    name="contactInfo.phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Phone"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    LinkedIn
                  </label>
                  <Controller
                    name="contactInfo.linkedin"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="LinkedIn URL"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    GitHub
                  </label>
                  <Controller
                    name="contactInfo.github"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="GitHub URL"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Portfolio URL
                  </label>
                  <Controller
                    name="portfolio"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Portfolio URL"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Experience and Skills */}
          {currentStep === 1 && (
            <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 col-span-2">
            <h3 className="text-white font-semibold text-xl mb-4">
              Add New Experience
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                value={newExperience.jobTitle}
                onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                placeholder="Job Title"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                value={newExperience.company}
                onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                placeholder="Company"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                value={newExperience.duration}
                onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                placeholder="Duration"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Textarea
                value={newExperience.responsibilities}
                onChange={(e) => setNewExperience({ ...newExperience, responsibilities: e.target.value })}
                placeholder="Responsibilities"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddExperience}
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
            >
              Add Experience
            </Button>
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold text-xl mb-4">
              Added Experiences
            </h3>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-4">
                {experienceFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-700 p-3 rounded-lg relative hover:bg-gray-650 transition-colors"
                  >
                    <Button
                      type="button"
                      onClick={() => removeExperience(index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-auto p-1 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded-full"
                    >
                      <X size={18} />
                    </Button>
                    <Controller
                      name={`experiences.${index}.jobTitle`}
                      control={control}
                      render={({ field }) => (
                        <h4 className="text-indigo-400 font-medium text-lg break-words pr-4">
                          {field.value}
                        </h4>
                      )}
                    />
                    <Controller
                      name={`experiences.${index}.company`}
                      control={control}
                      render={({ field }) => (
                        <h3 className="text-white">{field.value}</h3>
                      )}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Skills
                  </label>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => {
                      const [inputValue, setInputValue] = useState("");

                      const handleAddSkill = () => {
                        if (inputValue.trim() !== "") {
                          addSkill(inputValue.trim());
                          setInputValue("");
                        }
                      };

                      return (
                        <div className="relative">
                          <Input
                            value={inputValue}
                            placeholder="Type a skill and press Enter"
                            className="bg-gray-800 border-gray-700 text-white pr-10"
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                inputValue.trim() !== ""
                              ) {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 transform -translate-y-1/2 right-2 flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-500 transition duration-200"
                            onClick={handleAddSkill}
                          >
                            +
                          </button>
                        </div>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-indigo-600 text-white flex items-center"
                    >
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-white hover:text-red-500"
                        onClick={() => removeSkill(skill)}
                      >
                        <X size={14} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
 {/* Step 3: Education and Certifications */}
 {currentStep === 2 && (
  <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Education</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 col-span-2">
            <h3 className="text-white font-semibold text-xl mb-4">
              Add New Education
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                placeholder="Degree"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                value={newEducation.fieldOfStudy}
                onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
                placeholder="Field of Study"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                value={newEducation.institution}
                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                placeholder="Institution"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                value={newEducation.yearGraduated}
                onChange={(e) => setNewEducation({ ...newEducation, yearGraduated: e.target.value })}
                placeholder="Year Graduated"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddEducation}
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
            >
              Add Education
            </Button>
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold text-xl mb-4">
              Added Educations
            </h3>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-4">
                {educationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-700 p-3 rounded-lg relative hover:bg-gray-650 transition-colors"
                  >
                    <Button
                      type="button"
                      onClick={() => removeEducation(index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-auto p-1 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded-full"
                    >
                      <X size={18} />
                    </Button>
                    <Controller
                      name={`educations.${index}.degree`}
                      control={control}
                      render={({ field }) => (
                        <h4 className="text-indigo-400 font-medium text-lg break-words pr-4">
                          {field.value}
                        </h4>
                      )}
                    />
                    <Controller
                      name={`educations.${index}.institution`}
                      control={control}
                      render={({ field }) => (
                        <h3 className="text-white">{field.value}</h3>
                      )}
                    />
                    <Controller
                      name={`educations.${index}.fieldOfStudy`}
                      control={control}
                      render={({ field }) => (
                        <p className="text-gray-300">{field.value}</p>
                      )}
                    />
                    <Controller
                      name={`educations.${index}.yearGraduated`}
                      control={control}
                      render={({ field }) => (
                        <p className="text-gray-400">{field.value}</p>
                      )}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-86">
            <Button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={
                currentStep === steps - 1 ? handleSubmit(onSubmit) : handleNext
              }
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {currentStep === steps - 1 ? "Submit" : "Next"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OnboardingForm;
