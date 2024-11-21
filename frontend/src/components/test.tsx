type ProfileForm = {
    name: string;
    contactInfo: {
      email: string;
      phone: string;
      linkedin: string;
      github: string;
    };
    skills: string[];
    experience: {
      jobTitle: string;
      company: string;
      duration: string;
      responsibilities: string[];
    }[];
    education: {
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
    portfolio: string[];
  };


  export default ProfileForm