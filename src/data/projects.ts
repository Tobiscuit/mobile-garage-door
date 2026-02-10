export const portfolioItems = [
  {
    id: 'suburban-residence-new-garage-door-installation',
    title: 'Suburban Residence - New Garage Door Installation',
    subtitle: 'A showcase of our commitment to quality, safety, and aesthetics.',
    challenge: `The homeowner's existing garage door was outdated, unsafe, and detracting from the property's curb appeal. It posed security risks and was inefficient in terms of insulation, failing to meet modern standards for residential properties.`,
    solution: `Our expert technician performed a full removal and disposal of the old door, followed by the precise installation of a new, high-performance, modern garage door. We ensured all safety standards were exceeded and calibrated the system for optimal, quiet operation.`,
    imageAfter: 'garage-pattern-modern',
    imageBefore: 'garage-pattern-wooden',
    benefits: [
      'Enhanced Curb Appeal: A modern design that significantly boosts the property\'s value and aesthetic.',
      'Improved Security & Safety: State-of-the-art locking mechanisms and safety sensors for peace of mind.',
      'Increased Energy Efficiency: Superior insulation reduces heating and cooling costs, contributing to long-term savings.',
      'Professional & Efficient Installation: Our streamlined process ensures minimal disruption and adherence to project timelines.',
    ],
  },
  {
    id: 'modern-aluminum-door-installation',
    title: 'Modern Aluminum Door Installation',
    subtitle: 'Sleek design for contemporary homes.',
    challenge: 'Client desired a minimalist, high-tech garage door to complement their modern architectural style, replacing an old, noisy wooden door.',
    solution: 'Installed a custom-fabricated aluminum door with frosted glass panels, integrated smart opener, and silent operation. Enhanced security features were also included.',
    imageAfter: 'garage-pattern-modern',
    imageBefore: 'garage-pattern-wooden',
    benefits: [
      'Contemporary Aesthetic: Instantly upgrades home exterior with a sleek, modern look.',
      'Durability & Low Maintenance: Aluminum resists rust and requires minimal upkeep.',
      'Smart Home Integration: Seamlessly connects with existing smart home systems.',
      'Quiet Operation: Advanced mechanisms ensure smooth and silent performance.',
    ],
  },
  {
    id: 'classic-wooden-door-replacement',
    title: 'Classic Wooden Door Replacement',
    subtitle: 'Timeless elegance meets modern functionality.',
    challenge: 'Homeowner wanted to restore the traditional charm of their historic property while improving garage door security and insulation.',
    solution: 'Replaced an aging, uninsulated door with a custom-built solid wood carriage-style door, featuring enhanced insulation, robust locking, and a period-appropriate finish.',
    imageAfter: 'garage-pattern-carriage',
    imageBefore: 'garage-pattern-glass',
    benefits: [
      'Authentic Charm: Preserves and enhances the historical aesthetic of the property.',
      'Superior Insulation: Provides excellent thermal performance, reducing energy costs.',
      'Increased Property Value: High-quality wood doors are a significant investment.',
      'Customizable Design: Tailored to match specific architectural styles and preferences.',
    ],
  },
  {
    id: 'custom-glass-panel-door-installation',
    title: 'Custom Glass Panel Door Installation',
    subtitle: 'Maximizing natural light and curb appeal.',
    challenge: 'Client desired a unique garage door that would allow natural light into their garage space, which was being converted into a home office.',
    solution: 'Designed and installed a full-view glass panel garage door with a durable black aluminum frame. Used insulated, tempered glass for safety and energy efficiency.',
    imageAfter: 'garage-pattern-glass',
    imageBefore: 'garage-pattern-steel',
    benefits: [
      'Abundant Natural Light: Transforms garage into a brighter, more inviting space.',
      'Modern & Unique Look: Creates a striking architectural statement.',
      'Energy Efficient Glass: Reduces heat transfer while providing clear views.',
      'Enhanced Versatility: Ideal for garages used as workshops, studios, or offices.',
    ],
  },
  {
    id: 'sectional-steel-door-upgrade',
    title: 'Sectional Steel Door Upgrade',
    subtitle: 'Robust security and enhanced insulation.',
    challenge: 'An industrial client needed a highly durable and secure garage door for their warehouse, capable of withstanding heavy use and providing superior insulation.',
    solution: 'Installed a heavy-duty sectional steel door with a high R-value insulation, reinforced panels, and a commercial-grade opener system for reliable, long-term performance.',
    imageAfter: 'garage-pattern-steel',
    imageBefore: 'garage-pattern-carriage',
    benefits: [
      'Industrial Strength: Built to withstand rigorous daily operation and impacts.',
      'Superior Security: Reinforced steel panels and advanced locking mechanisms.',
      'Optimal Insulation: Significantly reduces energy costs in large spaces.',
      'Customizable Sizes: Available in various dimensions to fit any commercial opening.',
    ],
  },
  {
    id: 'carriage-house-door-installation',
    title: 'Carriage House Door Installation',
    subtitle: 'Old-world charm with modern convenience.',
    challenge: 'Homeowner wanted to achieve a rustic, carriage-house aesthetic for their garage, but with the convenience of an automatic opener.',
    solution: 'Installed a composite carriage-house style door that mimics the look of traditional swing-out doors but operates as a modern overhead door. Features decorative hardware and a wood-grain finish.',
    imageAfter: 'garage-pattern-modern',
    imageBefore: 'garage-pattern-wooden',
    benefits: [
      'Rustic Elegance: Adds significant curb appeal with a classic, handcrafted look.',
      'Low Maintenance: Composite materials offer durability without the upkeep of real wood.',
      'Modern Functionality: Operates smoothly with an automatic opener for convenience.',
      'Energy Efficient: Insulated panels help maintain garage temperature.',
    ],
  },
];

// Helper to get previous/next project IDs
export const getProjectNavigation = (currentId: string) => {
  const currentIndex = portfolioItems.findIndex(item => item.id === currentId);
  const previousProject = currentIndex > 0 ? portfolioItems[currentIndex - 1] : null;
  const nextProject = currentIndex < portfolioItems.length - 1 ? portfolioItems[currentIndex + 1] : null;
  return { previousProject, nextProject };
};
