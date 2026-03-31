"use client";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";

const contactInfo = [
  { icon: Mail, label: "Email Us", value: "support@devaihumanizer.com" },
  { icon: MapPin, label: "Our Office", value: "San Francisco, CA" },
  { icon: Clock, label: "Response Time", value: "Within 24 hours" },
];

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership / Business" },
  { value: "job", label: "Job Application" },
];

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  resumeLink?: string;
}

const Contact = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general",
    resumeLink: "",
  });

  useEffect(() => {
    const type = searchParams.get("type");
    const role = searchParams.get("role");
    if (type === "job") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "job",
        subject: role ? `Application for: ${role}` : "",
      }));
    }
  }, [searchParams]);

  // ✅ Validate all fields
  const validate = (data: typeof formData): FormErrors => {
    const errs: FormErrors = {};
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,3}$/;
    const nameRegex = /^(?! )[A-Za-z ]{3,30}$/;
    if (!data.name.trim()) {
      errs.name = "Name is required";
    } else if (data.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    } else if (!nameRegex.test(data.name.trim())) {
      errs.name = "Name can only contain letters";
    }

    if (!data.email.trim()) {
      errs.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
      errs.email = "Enter a valid email address";
    }

    if (!data.subject.trim()) {
      errs.subject = "Subject is required";
    } else if (data.subject.trim().length < 3) {
      errs.subject = "Subject must be at least 3 characters";
    }

    if (!data.message.trim()) {
      errs.message = "Message is required";
    } else if (data.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters";
    } else if (data.message.trim().split(/\s+/).length > 2000) {
      errs.message = "Message cannot exceed 2000 words";
    }

    if (data.inquiryType === "job" && data.resumeLink.trim()) {
      try {
        new URL(data.resumeLink);
      } catch {
        errs.resumeLink =
          "Enter a valid URL (e.g. https://linkedin.com/in/...)";
      }
    }

    return errs;
  };

  // ✅ Check if form is valid for button state
  const isFormValid = () => {
    const errs = validate(formData);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // Validate on change if field already touched
    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  // ✅ Mark field as touched on blur and show error
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(formData));
  };

  const handleInquiryChange = (value: string) => {
    const updated = { ...formData, inquiryType: value };
    setFormData(updated);
    setErrors(validate(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Touch all fields on submit to show all errors
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
      resumeLink: true,
    });

    const errs = validate(formData);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;
    if (sending) return;

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { formData },
      });
      if (error) throw new Error(error.message || "Request failed. Try again.");

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general",
        resumeLink: "",
      });
      setTouched({});
      setErrors({});
    } catch {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="section-padding">
          <div className="container-tight px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Have a question, feedback, or partnership inquiry? We would love
                to hear from you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {contactInfo.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-premium p-6 text-center"
                >
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-display font-semibold mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <form
                onSubmit={handleSubmit}
                className="glass-card-premium p-8 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-accent/50 border-border/50 ${
                        touched.name && errors.name
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />
                    {touched.name && errors.name && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-accent/50 border-border/50 ${
                        touched.email && errors.email
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Inquiry Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {inquiryTypes.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleInquiryChange(t.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
                          formData.inquiryType === t.value
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-border"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="subject"
                    placeholder={
                      formData.inquiryType === "job"
                        ? "Position you're applying for"
                        : "How can we help?"
                    }
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`bg-accent/50 border-border/50 ${
                      touched.subject && errors.subject
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  {touched.subject && errors.subject && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Resume Link — job only */}
                {formData.inquiryType === "job" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Resume / Portfolio Link
                    </label>
                    <Input
                      name="resumeLink"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.resumeLink}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`bg-accent/50 border-border/50 ${
                        touched.resumeLink && errors.resumeLink
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />
                    {touched.resumeLink && errors.resumeLink && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.resumeLink}
                      </p>
                    )}
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={
                      formData.inquiryType === "job"
                        ? "Tell us about yourself and why you'd be a great fit..."
                        : "Tell us more..."
                    }
                    className={`bg-accent/50 border-border/50 ${
                      touched.message && errors.message
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.message}
                    </p>
                  )}
                  {/* ✅ Character count hint */}
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formData.message.length} characters
                    {formData.message.length < 10 && formData.message.length > 0
                      ? ` (${10 - formData.message.length} more needed)`
                      : ""}
                  </p>
                </div>

                {/* ✅ Submit — disabled when invalid or sending */}
                <Button
                  variant="hero"
                  size="lg"
                  type="submit"
                  disabled={sending || !isFormValid()}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Fields marked with <span className="text-destructive">*</span>{" "}
                  are required
                </p>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
