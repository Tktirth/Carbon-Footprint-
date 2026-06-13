import{j as e}from"./index-B-aSVAgR.js";const n={emerald:"border-t-emerald-500",blue:"border-t-blue-500",amber:"border-t-amber-500",red:"border-t-red-500",violet:"border-t-violet-500",cyan:"border-t-cyan-500"},m={none:"p-0",sm:"p-4",md:"p-6",lg:"p-8"};function c({title:r,subtitle:s,children:o,className:d="",accent:a,hoverable:t=!1,padding:l="md"}){return e.jsxs("div",{className:`
        glass-card ${m[l]}
        ${a?`border-t-2 ${n[a]}`:""}
        ${t?"transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl hover:-translate-y-1":""}
        ${d}
      `,children:[(r||s)&&e.jsxs("div",{className:"mb-4",children:[r&&e.jsx("h3",{className:"text-lg font-semibold text-white",children:r}),s&&e.jsx("p",{className:"text-sm text-gray-400 mt-1",children:s})]}),o]})}export{c as C};
