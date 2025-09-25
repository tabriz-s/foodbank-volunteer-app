import React from "react";
import { CircleUser } from "lucide-react"

const About = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        About Our Food Bank
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-green-100">
                        Together, we fight hunger and bring hope to families in need
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-700 mb-10">
                        We are committed to reducing food insecurity by connecting
                        volunteers, local food banks, and communities. Through
                        collaboration, compassion, and innovation, we ensure that no family
                        has to go hungry.
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                    <p className="text-lg text-gray-700">
                        A community where everyone has consistent access to nutritious meals
                        and the opportunity to thrive, thanks to the dedication of
                        volunteers and the generosity of partners.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
                            <p className="text-gray-600">
                                We partner with communities, volunteers, and organizations to
                                maximize impact.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💙</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Compassion</h3>
                            <p className="text-gray-600">
                                We serve with empathy, treating everyone with dignity and
                                respect.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🌱</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                            <p className="text-gray-600">
                                We focus on long-term solutions to reduce hunger and food waste.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                        <p className="text-gray-600">
                            Our dedicated volunteers and staff make everything possible!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <CircleUser size={128} className="mx-auto mb-4 text-blue-400" />
                            <h3 className="text-xl font-semibold">Jane Doe</h3>
                            <p className="text-gray-500">Executive Director</p>
                        </div>

                        <div className="p-6">
                            <CircleUser size={128} className="mx-auto mb-4 text-yellow-400" />
                            <h3 className="text-xl font-semibold">John Smith</h3>
                            <p className="text-gray-500">Volunteer Coordinator</p>
                        </div>

                        <div className="p-6">
                            <CircleUser size={128} className="mx-auto mb-4 text-green-400" />
                            <h3 className="text-xl font-semibold">Emily Johnson</h3>
                            <p className="text-gray-500">Community Outreach</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
