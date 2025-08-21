import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Building2, 
  Zap, 
  Droplets, 
  Heart, 
  Wheat, 
  GraduationCap, 
  Smartphone, 
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ServiceCategoriesProps {
  onAIToggle: () => void;
}

const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ onAIToggle }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const services = [
    {
      emoji: '🏛️',
      icon: Building2,
      label: 'Government Forms',
      description: 'Fill forms with voice guidance',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      emoji: '💡',
      icon: Zap,
      label: 'Electricity Issue',
      description: 'Register & track complaints',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      emoji: '💧',
      icon: Droplets,
      label: 'Water Problem',
      description: 'Lodge water-related issues',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    {
      emoji: '🏥',
      icon: Heart,
      label: 'Medical Help',
      description: 'Find hospitals & health services',
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      emoji: '🚜',
      icon: Wheat,
      label: 'Farming Support',
      description: 'Agriculture guidance & schemes',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      emoji: '📚',
      icon: GraduationCap,
      label: 'Education Help',
      description: 'Course info & form assistance',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      emoji: '🧑‍💻',
      icon: Smartphone,
      label: 'Technical Support',
      description: 'Phone, app & website help',
      color: 'from-gray-500 to-slate-600',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30'
    },
    {
      emoji: '📞',
      icon: Phone,
      label: 'Emergency Help',
      description: 'Urgent assistance & contacts',
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-600/10',
      borderColor: 'border-red-600/30'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="services" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              हमारी सेवाएं
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose any service and let our AI assistant guide you through the process with simple voice commands
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={onAIToggle}
              className={`group relative ${service.bgColor} backdrop-blur-sm border ${service.borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                {/* Icon Section */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <span className="text-2xl">{service.emoji}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">
                    {service.label}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {service.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`w-3 h-3 bg-gradient-to-r ${service.color} rounded-full animate-pulse`} />
                </div>
              </div>

              {/* Click effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 0.2 }}
                style={{ background: `linear-gradient(45deg, ${service.color.split(' ')[1]}, ${service.color.split(' ')[3]})` }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={onAIToggle}
            className="bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 px-8 py-4 rounded-full font-bold text-lg shadow-xl flex items-center space-x-3 mx-auto transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🎤</span>
            <span>Start Voice Assistant</span>
            <FileText className="w-5 h-5" />
          </motion.button>
          <p className="text-gray-400 mt-4 text-sm">
            Click on any service above or use voice commands to get started
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCategories;