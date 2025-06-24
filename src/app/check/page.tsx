export default function App() {
  return (
    <div className="bg-gray-100">

      {/* Hero Section */}
      <section className="bg-blue-500 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">My Portfolio</h1>
          <p className="text-xl mb-8">Welcome to my online portfolio. I'm a Frontend React Developer</p>
          <button className="bg-white text-blue-500 py-3 px-6 rounded-full hover:bg-blue-100">Learn More</button>
        </div>
      </section>


      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">About Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src="placeholder-image.jpg" alt="Profile Picture" className="w-full rounded-lg shadow-lg"/>
            </div>
            <div>
              <p className="text-lg">I am a passionate frontend React developer with expertise in building responsive and user-friendly web applications.  I love creating clean, efficient, and visually appealing interfaces.</p>
              <p className="text-lg mt-4">My skills include React, Tailwind CSS, JavaScript, and various other frontend technologies.  I am always eager to learn new things and expand my skillset. </p>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section className="bg-gray-200 py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Me</h2>
          <p className="text-lg mb-8">Let's connect!  Feel free to reach out.</p>
          <form>
            <input type="text" placeholder="Your Name" className="w-full md:w-1/2 mx-auto mb-4 p-3 border rounded"/>
            <input type="email" placeholder="Your Email" className="w-full md:w-1/2 mx-auto mb-4 p-3 border rounded"/>
            <textarea placeholder="Your Message" className="w-full md:w-1/2 mx-auto mb-4 p-3 border rounded"></textarea>
            <button className="bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600">Send Message</button>
          </form>
        </div>
      </section>

    </div>
  );
}
