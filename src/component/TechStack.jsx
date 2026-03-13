import React from 'react';

const TechStack = () => {
    const TECH = [
  {emoji:"⚛️",name:"React",       desc:"Component-based UI framework"},
  {emoji:"⚡",name:"Vite",        desc:"Fast modern build tool"},
  {emoji:"🎨",name:"Tailwind CSS", desc:"Utility-first CSS framework"},
  {emoji:"📊",name:"Recharts",    desc:"Interactive charts & visualisations"},
];

    return (
        <div>
            <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="badge" style={{background:"#eef2ff",color:"#4338ca"}}>Built With</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3">Technology Stack</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TECH.map(t=>(
            <div key={t.name} className="card-lift bg-gray-50 border border-gray-200 rounded-2xl p-7 text-center">
              <div className="text-5xl mb-4">{t.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-1">{t.name}</h3>
              <p className="text-gray-400 text-xs">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
        </div>
    );
};

export default TechStack;