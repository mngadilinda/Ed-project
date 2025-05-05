// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ChevronRightIcon, 
  RocketLaunchIcon,
  BookOpenIcon,
  LightBulbIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline';
import hero_img from '../assets/ed_img1.jpg'

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <BookOpenIcon className="h-12 w-12 text-primary" />,
      title: 'Comprehensive Curriculum',
      description: 'From 8th grade to university-level courses in math, chemistry, and more'
    },
    {
      icon: <LightBulbIcon className="h-12 w-12 text-primary" />,
      title: 'Interactive Learning',
      description: 'Engaging lessons with videos, quizzes, and real-world applications'
    },
    {
      icon: <TrophyIcon className="h-12 w-12 text-primary" />,
      title: 'Achievement Tracking',
      description: 'Monitor your progress and earn badges as you master concepts'
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, features.length]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/10 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]" />
        
        <div className="container mx-auto px-6 py-24 md:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              From Curiosity to Mastery with <span className="text-primary">Ed-Master</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              Your personalized learning journey from school through university. 
              Build strong foundations and advance to complex concepts at your own pace.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg">
                <Link to="/register">
                  Get Started <RocketLaunchIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/courses">
                  Explore Courses <ChevronRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 flow-root sm:mt-24"
          >
            <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl">
              <img
                src={hero_img}
                alt="App screenshot"
                className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Ed-Master?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform is designed to help you succeed at every level of your science education.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full p-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animated Feature Showcase */}
      <section className="bg-primary/5 py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-12">
              How It Works
            </h2>
            
            <div className="relative h-96 rounded-xl overflow-hidden bg-white shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 text-center"
                  >
                    <div className="mb-6">{features[currentFeature].icon}</div>
                    <h3 className="text-2xl font-bold mb-2">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {features[currentFeature].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`h-3 w-3 rounded-full transition-colors ${
                      index === currentFeature ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Join thousands of students mastering science subjects with our proven approach.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/pricing">
                  View Pricing Plans
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20" asChild>
                <Link to="/courses">
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;