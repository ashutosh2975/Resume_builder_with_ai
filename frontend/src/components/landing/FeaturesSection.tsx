import { motion } from "framer-motion";
import { Layout, Eye, Download, Palette } from "lucide-react";

const features = [
  {
    icon: Layout,
    title: "Intuitive Builder",
    description: "Step-by-step form wizard that guides you through creating the perfect resume.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "See your resume update in real-time as you type, with instant visual feedback.",
  },
  {
    icon: Palette,
    title: "Professional Templates",
    description: "Choose from beautifully designed templates that are ATS-friendly and print-ready.",
  },
  {
    icon: Download,
    title: "Easy Export",
    description: "Download your finished resume as a polished PDF ready for applications.",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to <span className="gradient-text">stand out</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features designed to help you create resumes that get noticed.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item} className="glass-card rounded-2xl p-6 hover-lift cursor-default group">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
