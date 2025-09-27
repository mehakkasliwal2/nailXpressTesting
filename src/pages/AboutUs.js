import React from 'react';
// Founder image will be loaded from public folder

export default function AboutUs() {
	return (
		<div className="min-h-screen bg-gradient-to-r from-pink-600 to-pink-300">
			{/* Hero Section with Background */}
			<div className="relative bg-gradient-to-r from-pink-600 to-pink-300 text-white py-8">
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-3xl font-bold mb-2">About Us</h1>
					<p className="text-lg text-pink-100">The story behind nailXpress</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
				<div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
						<div>
							<img
								src="/me.jpg"
								alt="Founder"
								className="w-full rounded-lg object-cover shadow-lg"
							/>
						</div>
						<div className="space-y-6">
							<div>
								<p className="text-gray-700 leading-relaxed text-lg">
									Hey guys, I'm Mehak! I'm currently a senior at USC, and I'm super excited you decided to check out nailXpress!
								</p>
								<p className="text-gray-700 leading-relaxed mt-4 text-lg">
									I first started nailXpress in 2021 to support home-based nail artists and give them a platform to showcase their talent and grow their businesses. During the pandemic, many nail artists lost their source of income, and I wanted to create a safer, lasting alternative for them to keep doing what they love while helping others with a little self-care.
								</p>
								<p className="text-gray-700 leading-relaxed mt-4 text-lg">
									After taking a break to focus on school and other projects, I'm back with a new version of nailXpress, built with a fresh design, new features, and more ways to connect artists with clients.
								</p>
								<p className="text-gray-700 leading-relaxed mt-4 text-lg">
									Our mission is to empower independent nail artists and bring more visibility to their work. We're creating a community where beauty and creativity meet accessibility and convenience. Artists can share their portfolios, and clients can directly discover and book appointments with them.
								</p>
								<p className="text-gray-700 leading-relaxed mt-4 text-lg">
									I hope you love using nailXpress as much as I've loved creating it. Feel free to reach out with any questions, suggestions, or just to say hi, I'd love to hear from you!
								</p>
								
								
								<p className="text-gray-700 leading-relaxed text-lg mt-6">
									<span className="text-gray-700">Contact:</span>
									<span className="ml-2">
										<a 
											href="https://www.linkedin.com/in/mehak-kasliwal-517512223/" 
											target="_blank" 
											rel="noreferrer"
											className="inline-flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
										>
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
											</svg>
											<span>LinkedIn</span>
										</a>
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}