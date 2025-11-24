🍎 Project Specification: "Arxan's Planet" (Apple Aesthetic Edition)

Stack: Nuxt 3, Vue 3, SQLite, Globe.gl, TailwindCSS.

1. Design System: The "Apple" Look

    Theme: Apple "Pro" Dark Mode.

    Typography: System UI Fonts (San Francisco/Inter).

        CSS: font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;

    Materials (Glassmorphism):

        Heavy use of backdrop-filter: blur().

        Translucent backgrounds (bg-white/10 or bg-black/40).

        Subtle borders (border border-white/10) to simulate light catching the edge.

    Shapes: Large border radius (rounded-3xl or rounded-full).

2. Frontend Implementation (Vue 3 + Globe.gl)

A. The Environment (Clean & Cinematic)

    Background: Instead of a messy low-res starfield, use a Deep Space Gradient or a very sparse, sharp starfield.

        Style: A radial gradient from #1a1a1a to #000000.

    The Globe:

        Atmosphere: Enable atmosphereAltitude (0.15) with a cool blue glow (#4facfe) to give it that premium "render" look.

        Markers:

            Instead of flat circles, use pulsing rings that look like radar blips.

            Barcelona: A "Notification Blue" pulse.

            Home: A "Home icon" static on BandarAbbas-IRAN.

B. The UI Overlay (The "Dynamic Island" Feel)

1. The Header ("Arxan")

    Location: Top Center, floating.

    Style: Large, Tracking (Letter spacing) slightly wide, Thin weight.

    Effect: Fade in on load.

    Tailwind: text-5xl font-thin tracking-widest text-white/90 drop-shadow-2xl

2. The "Dock" (Socials)

    Location: Floating at the bottom center (like the macOS Dock or iOS Home bar).

    Design: A pill-shaped glass container.

        Tailwind: flex gap-6 px-8 py-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl

    Interactions: Buttons should have a slight scale-up on hover (hover:scale-110 transition-all duration-300 ease-out).

3. The Contact Form (The Modal)

    Trigger: A button in the "Dock" that says "Contact".

    Design: When clicked, opens a centered Modal.

        Look: Frosted glass card.

        Tailwind: bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]

    Inputs:

        Large, pill-shaped or rounded-xl inputs.

        Dark background (bg-white/5), no border until focused.

        Focus state: A soft blue glow (ring-2 ring-blue-500/50).

    The Honeypot (Hidden): Keep the CSS hiding technique (opacity-0 absolute -z-10).

3. Backend Implementation (Nuxt) -> Unchanged

    ContactController: The logic remains the same (Detect honeypot -> Return 200 OK -> Don't save). The "Apple" design is purely frontend; the backend remains a silent security guard.

4. Prompt for the Agent to copy/paste:

    "Generate a Nuxt 3 + Vue 3 project. Use TailwindCSS.

    Design Directive: The UI must mimic Apple's Human Interface Guidelines.

        Use a 'Glassmorphism' aesthetic for all UI panels (high blur, low opacity backgrounds, thin white borders).

        Fonts should be system-sans, clean, and legible.

        Buttons should be 'pill' shaped (rounded-full).

        Motion should be smooth (ease-out).

    The Globe: Use globe.gl. It should look cinematic. Features:

        Rotates automatically.

        Day/Night texture swap based on user time (Day: 6am-6pm, Night: 6pm-6am).

        Markers: A pulsing red ring at Barcelona (Lat: 41.3874, Lng: 2.1686) and a static blue dot at my Home [Insert Coords].

    Contact Form:

        A glass modal.

        Honey Pot Security: Include a hidden input named honey_pot_field.

        Laravel Controller: If honey_pot_field has text, return success but do not save to SQLite. If empty, save the message."

One specific detail for you (The Apple Font)

Since you can't legally download Apple's "San Francisco" font for a web project (it's licensed only for Apple devices), tell the agent to use this font stack in Tailwind. It automatically picks up the Apple font on Macs/iPhones and the best alternative on Windows:
JavaScript

// tailwind.config.js
theme: {
  fontFamily: {
    sans: [
      "-apple-system", 
      "BlinkMacSystemFont", 
      "Segoe UI", 
      "Roboto", 
      "Helvetica", 
      "Arial", 
      "sans-serif"
    ],
  },
}

const CONFIG = {
    // 🌌 Background
    bgUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
    
    // ☀️ Day Map (The high quality one)
    dayUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    
    // 🌙 Night Map (City Lights)
    nightUrl: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    
    // 🏔️ Topology (Mountains shadow)
    bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    
    // 💧 Water (Reflections)
    waterUrl: '//unpkg.com/three-globe/example/img/earth-water.png',
};

// ... inside onMounted ...

// Logic: Use Day texture if between 6am and 6pm, otherwise Night texture
const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
const currentTexture = isDay ? CONFIG.dayUrl : CONFIG.nightUrl;

globeInstance = Globe()
    (globeDiv.value)
    .globeImageUrl(currentTexture)
    .bumpImageUrl(CONFIG.bumpUrl)
    .backgroundImageUrl(CONFIG.bgUrl)
    .atmosphereColor('#4facfe')
    .atmosphereAltitude(0.15);

// ⚡ PRO TIP: Enable the Water Mask for the "Apple" Shine
// This uses the earth-water.png to define shiny vs matte areas
globeInstance.globeMaterial().specularMap = new THREE.TextureLoader().load(CONFIG.waterUrl);
globeInstance.globeMaterial().specular = new THREE.Color('grey'); // Controls reflection intensity
globeInstance.globeMaterial().shininess = 15; // Shiny oceans