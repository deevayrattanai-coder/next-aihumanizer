import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is an AI humanizer and how does it work?",
    a: "An AI humanizer is a tool that transforms AI-generated text into content that reads as if it was written by a human. DevAIHumanizer uses advanced natural language processing algorithms to analyze sentence structure, word choice, and writing patterns, then restructures the text to match human writing characteristics while preserving the original meaning.",
  },
  {
    q: "Can humanized text bypass AI detectors like GPTZero and Turnitin?",
    a: "Yes! DevAIHumanizer achieves a 99.8% bypass rate across all major AI detection platforms including GPTZero, Turnitin, Originality.ai, Copyleaks, and ZeroGPT. Our algorithm is constantly updated to stay ahead of detection model improvements.",
  },
  {
    q: "Is the humanized content plagiarism-free?",
    a: "Absolutely. Our humanizer doesn't copy from any existing sources. It restructures and rewrites your original AI-generated content using unique phrasing and natural language patterns, ensuring 100% original output every time.",
  },
  {
    q: "How many words can I humanize for free?",
    a: "Our free plan allows you to humanize up to 2,000 words after creating an account. This gives you enough to test our tool and see the quality for yourself. For higher volumes, check out our affordable Pro and Enterprise plans.",
  },
  {
    q: "Does DevAIHumanizer support languages other than English?",
    a: "Yes! DevAIHumanizer supports over 30 languages including Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Arabic, and many more. Our multilingual models ensure natural output regardless of the language.",
  },
  {
    q: "Is my content safe and private?",
    a: "Your privacy is our top priority. All content is processed in real-time and immediately deleted after conversion. We never store your text, use it for model training, or share it with third parties. All transfers are encrypted with TLS 1.3.",
  },
  {
    q: "What AI-generated content can I humanize?",
    a: "You can humanize text from any AI tool — ChatGPT, GPT-4, Claude, Gemini, Jasper, Copy.ai, and more. Whether it's blog posts, essays, emails, social media content, or academic writing, our tool handles it all.",
  },
  {
    q: "How is DevAIHumanizer different from a simple paraphrasing tool?",
    a: "Paraphrasing tools simply swap synonyms and rearrange words. DevAIHumanizer goes much deeper — it analyzes writing patterns, adjusts sentence rhythm, adds natural imperfections, varies vocabulary, and restructures paragraphs to authentically mimic human writing style.",
  },
];

const FAQ = () => {
  return (
    <section className="section-padding section-glow-divider">
      <div className="container-tight px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about DevAIHumanizer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card-premium px-4 sm:px-6 border-none"
              >
                <AccordionTrigger className="text-left font-display font-medium text-sm sm:text-base text-foreground hover:text-primary hover:no-underline py-4 sm:py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
