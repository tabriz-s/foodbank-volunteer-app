import React from "react";
import { Users, Heart, Leaf, CircleUser } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        About Our Food Bank
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-green-100">
                        Together, we fight hunger and bring hope to families in need
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
                        We are committed to reducing food insecurity by connecting
                        volunteers, local food banks, and communities. Through
                        collaboration, compassion, and innovation, we ensure that no family
                        has to go hungry.
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        A community where everyone has consistent access to nutritious meals
                        and the opportunity to thrive, thanks to the dedication of
                        volunteers and the generosity of partners.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Core Values</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Collaboration</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We partner with communities, volunteers, and organizations to
                                maximize impact.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Compassion</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We serve with empathy, treating everyone with dignity and
                                respect.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Leaf className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sustainability</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We focus on long-term solutions to reduce hunger and food waste.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Our dedicated volunteers and staff make everything possible!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 border border-gray-200 dark:border-gray-600">
                            <CircleUser size={96} className="mx-auto mb-4 text-blue-400" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Javier Alvarez</h3>
                            <p className="text-gray-500 dark:text-gray-400">Executive Director</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 border border-gray-200 dark:border-gray-600">
                            <CircleUser size={96} className="mx-auto mb-4 text-yellow-400" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tadiwa Kabayadondo</h3>
                            <p className="text-gray-500 dark:text-gray-400">Volunteer Coordinator</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 border border-gray-200 dark:border-gray-600">
                            <CircleUser size={96} className="mx-auto mb-4 text-green-400" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tabriz Sadredinov</h3>
                            <p className="text-gray-500 dark:text-gray-400">Community Outreach</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 border border-gray-200 dark:border-gray-600">
                            <CircleUser size={96} className="mx-auto mb-4 text-red-400" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mohamed Uddin</h3>
                            <p className="text-gray-500 dark:text-gray-400">Fundraising Coordinator</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;