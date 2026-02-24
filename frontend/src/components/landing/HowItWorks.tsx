import { motion } from "framer-motion";
import { UserPlus, PenLine, Download } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Fill in your details", description: "Enter your information using our guided step-by-step form." },
  { icon: PenLine, title: "Customize & preview", description: "Choose a template and fine-tune your resume with live preview." },
  { icon: Download, title: "Download & apply", description: "Export your polished resume and start landing interviews." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 gradient-bg-subtle">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-muted-foreground text-lg">Three simple steps to your dream resume.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="relative inline-flex mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border-2 border-primary text-primary font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
