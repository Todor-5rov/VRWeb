import * as THREE from "three";

// List of locations with their coordinates
export const locations = [
  // North America
  {
    name: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    color: 0xff0000, // Red
  },
  {
    name: "Los Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
    color: 0x00ff00, // Green
  },
  {
    name: "Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
    color: 0x0080ff, // Light Blue
  },
  {
    name: "Toronto",
    latitude: 43.6532,
    longitude: -79.3832,
    color: 0xff8000, // Orange Red
  },
  {
    name: "Mexico City",
    latitude: 19.4326,
    longitude: -99.1332,
    color: 0x80ff00, // Lime Green
  },
  {
    name: "Miami",
    latitude: 25.7617,
    longitude: -80.1918,
    color: 0xff0080, // Hot Pink
  },
  {
    name: "Vancouver",
    latitude: 49.2827,
    longitude: -123.1207,
    color: 0x8000ff, // Purple Blue
  },
  {
    name: "Las Vegas",
    latitude: 36.1699,
    longitude: -115.1398,
    color: 0xffaa00, // Gold
  },

  // South America
  {
    name: "São Paulo",
    latitude: -23.5505,
    longitude: -46.6333,
    color: 0x800080, // Purple
  },
  {
    name: "Rio de Janeiro",
    latitude: -22.9068,
    longitude: -43.1729,
    color: 0xffff80, // Light Yellow
  },
  {
    name: "Buenos Aires",
    latitude: -34.6118,
    longitude: -58.396,
    color: 0x80ffff, // Light Cyan
  },
  {
    name: "Lima",
    latitude: -12.0464,
    longitude: -77.0428,
    color: 0xff8080, // Light Red
  },
  {
    name: "Bogotá",
    latitude: 4.711,
    longitude: -74.0721,
    color: 0x8080ff, // Light Purple
  },
  {
    name: "Santiago",
    latitude: -33.4489,
    longitude: -70.6693,
    color: 0x40ff40, // Bright Green
  },

  // Europe
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    color: 0x0000ff, // Blue
  },
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    color: 0x00ffff, // Cyan
  },
  {
    name: "Berlin",
    latitude: 52.52,
    longitude: 13.405,
    color: 0xffaa00, // Dark Orange
  },
  {
    name: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    color: 0xaa00ff, // Dark Purple
  },
  {
    name: "Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
    color: 0x00aaff, // Dark Cyan
  },
  {
    name: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    color: 0xffaa80, // Peach
  },
  {
    name: "Moscow",
    latitude: 55.7558,
    longitude: 37.6176,
    color: 0xaa80ff, // Light Purple
  },
  {
    name: "Stockholm",
    latitude: 59.3293,
    longitude: 18.0686,
    color: 0x80aaff, // Sky Blue
  },
  {
    name: "Vienna",
    latitude: 48.2082,
    longitude: 16.3738,
    color: 0xff80aa, // Pink
  },
  {
    name: "Barcelona",
    latitude: 41.3851,
    longitude: 2.1734,
    color: 0xaa8000, // Dark Gold
  },

  // Asia
  {
    name: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    color: 0xffff00, // Yellow
  },
  {
    name: "Beijing",
    latitude: 39.9042,
    longitude: 116.4074,
    color: 0xff4400, // Red Orange
  },
  {
    name: "Shanghai",
    latitude: 31.2304,
    longitude: 121.4737,
    color: 0x44ff00, // Bright Green
  },
  {
    name: "Mumbai",
    latitude: 19.076,
    longitude: 72.8777,
    color: 0xffc0cb, // Pink
  },
  {
    name: "Delhi",
    latitude: 28.7041,
    longitude: 77.1025,
    color: 0x00ff44, // Spring Green
  },
  {
    name: "Seoul",
    latitude: 37.5665,
    longitude: 126.978,
    color: 0x4400ff, // Blue Purple
  },
  {
    name: "Bangkok",
    latitude: 13.7563,
    longitude: 100.5018,
    color: 0xff0044, // Pink Red
  },
  {
    name: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    color: 0x0044ff, // Blue
  },
  {
    name: "Hong Kong",
    latitude: 22.3193,
    longitude: 114.1694,
    color: 0x44ffaa, // Mint Green
  },
  {
    name: "Kuala Lumpur",
    latitude: 3.139,
    longitude: 101.6869,
    color: 0xaa44ff, // Violet
  },
  {
    name: "Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
    color: 0xffaa44, // Gold
  },
  {
    name: "Manila",
    latitude: 14.5995,
    longitude: 120.9842,
    color: 0xaa4400, // Brown
  },
  {
    name: "Osaka",
    latitude: 34.6937,
    longitude: 135.5023,
    color: 0x00aa44, // Forest Green
  },
  {
    name: "Taipei",
    latitude: 25.033,
    longitude: 121.5654,
    color: 0x4400aa, // Indigo
  },

  // Middle East
  {
    name: "Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
    color: 0xffa500, // Orange
  },
  {
    name: "Istanbul",
    latitude: 41.0082,
    longitude: 28.9784,
    color: 0x00aaaa, // Teal
  },
  {
    name: "Tel Aviv",
    latitude: 32.0853,
    longitude: 34.7818,
    color: 0xaaaa00, // Olive
  },
  {
    name: "Riyadh",
    latitude: 24.7136,
    longitude: 46.6753,
    color: 0xaa0000, // Dark Red
  },
  {
    name: "Tehran",
    latitude: 35.6892,
    longitude: 51.389,
    color: 0x0000aa, // Dark Blue
  },
  {
    name: "Doha",
    latitude: 25.2854,
    longitude: 51.531,
    color: 0xaa00aa, // Purple
  },

  // Africa
  {
    name: "Cairo",
    latitude: 30.0444,
    longitude: 31.2357,
    color: 0x90ee90, // Light Green
  },
  {
    name: "Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
    color: 0xff6600, // Orange Red
  },
  {
    name: "Johannesburg",
    latitude: -26.2041,
    longitude: 28.0473,
    color: 0x6600ff, // Purple
  },
  {
    name: "Nairobi",
    latitude: -1.2921,
    longitude: 36.8219,
    color: 0x00ff66, // Green
  },
  {
    name: "Casablanca",
    latitude: 33.5731,
    longitude: -7.5898,
    color: 0x6666ff, // Light Blue
  },
  {
    name: "Cape Town",
    latitude: -33.9249,
    longitude: 18.4241,
    color: 0xff6666, // Light Red
  },
  {
    name: "Addis Ababa",
    latitude: 9.145,
    longitude: 40.4897,
    color: 0x66ff00, // Lime
  },
  {
    name: "Accra",
    latitude: 5.6037,
    longitude: -0.187,
    color: 0xff0066, // Rose
  },

  // Oceania
  {
    name: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    color: 0xff00ff, // Magenta
  },
  {
    name: "Melbourne",
    latitude: -37.8136,
    longitude: 144.9631,
    color: 0x66ff66, // Light Green
  },
  {
    name: "Auckland",
    latitude: -36.8485,
    longitude: 174.7633,
    color: 0x6666aa, // Blue Gray
  },
  {
    name: "Perth",
    latitude: -31.9505,
    longitude: 115.8605,
    color: 0xaa6666, // Rose
  },
  {
    name: "Brisbane",
    latitude: -27.4698,
    longitude: 153.0251,
    color: 0x66aa66, // Sage Green
  },
];

/**
 * Convert latitude and longitude to a 3D vector position on a sphere
 * Using the correct formula (Plum - Formula 14: Yellow X-Z swap -90°)
 * @param {number} latitude - Latitude in degrees (-90 to 90)
 * @param {number} longitude - Longitude in degrees (-180 to 180)
 * @param {number} radius - Radius of the sphere (default: 1)
 * @returns {THREE.Vector3} 3D position vector
 */
export function latLngToVector3(latitude, longitude, radius = 1) {
  const latRad = latitude * (Math.PI / 180);
  const lngRad = (longitude - 90) * (Math.PI / 180);
  const x = radius * Math.cos(latRad) * Math.sin(lngRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lngRad);
  return new THREE.Vector3(x, y, z);
}

/**
 * Create a marker for a location on the Earth
 * @param {Object} location - Location object with name, latitude, longitude, and color
 * @param {number} earthRadius - Radius of the Earth sphere
 * @returns {THREE.Group} Group containing the marker elements
 */
export function createLocationMarker(location, earthRadius = 1) {
  const markerGroup = new THREE.Group();

  // Get the 3D position for the location
  const position = latLngToVector3(
    location.latitude,
    location.longitude,
    earthRadius
  );

  // Create a small sphere marker
  const markerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: location.color,
    transparent: true,
    opacity: 0.9,
  });
  const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
  markerMesh.position.copy(position);

  // Create a glowing ring around the marker
  const ringGeometry = new THREE.RingGeometry(0.025, 0.035, 16);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: location.color,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.position.copy(position);
  ringMesh.lookAt(new THREE.Vector3(0, 0, 0)); // Face the center of the Earth

  // Create a pulsing animation for the marker
  markerMesh.userData = {
    originalScale: markerMesh.scale.clone(),
    pulseSpeed: 0.05,
    pulsePhase: Math.random() * Math.PI * 2,
    locationName: location.name,
  };

  ringMesh.userData = {
    originalScale: ringMesh.scale.clone(),
    pulseSpeed: 0.03,
    pulsePhase: Math.random() * Math.PI * 2,
    locationName: location.name,
  };

  markerGroup.add(markerMesh);
  markerGroup.add(ringMesh);
  markerGroup.userData.location = location;

  return markerGroup;
}

/**
 * Animate location markers with pulsing effect
 * @param {THREE.Group} markerGroup - The marker group to animate
 */
export function animateLocationMarker(markerGroup) {
  markerGroup.children.forEach((child) => {
    if (child.userData.pulseSpeed) {
      child.userData.pulsePhase += child.userData.pulseSpeed;
      const scale = 1 + Math.sin(child.userData.pulsePhase) * 0.3;
      child.scale.copy(child.userData.originalScale).multiplyScalar(scale);
    }
  });
}
