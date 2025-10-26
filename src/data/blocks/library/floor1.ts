/**
 * Library Floor 1 Area Definition
 *
 * Defines the main entrance area on the first floor of the Library.
 *
 * @fileoverview Contains route definition for Library Floor 1 with
 * navigation connections and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * Library Floor 1 Main Entrance Route
 *
 * Covers the main entrance area on the first floor of the Library.
 *
 * Key features:
 * - Main entrance access
 * - Connection to X Block
 */
export const libraryFloor1Area: Area = {
  id: 'library-floor-1-main',
  name: 'The Library',
  buildingBlock: 'x',
  floorLevel: 1,
  photos: [
    {
      id: 'library-f1-entrance',
      imageUrl: '/360_photos_compressed/library/library_floor1_entrance.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'library-f1-1' },
        door: 'x-f1-mid-6-library',
        up: 'library-f2-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 0, y: -0.35, z: 3 },
          destination: 'x-f1-mid-6-library'
        },
        {
          direction: 'up',
          position: { x: 0, y: 0, z: 5 }  // Stairs
        },
        {
          direction: 'information',
          position: { x: -5, y: -0.05, z: -1.25 },
          title: 'The Library',
          description: 'Welcome to Ara\'s City Campus Library, your hub for learning, research, and study support.\n\nThe library offers:\n• Extensive book and journal collections\n• Quiet and collaborative study spaces\n• Computer stations and printing services\n• Research assistance from library staff\n• Learning Services support (located on floor 1)\n• StudySmart online resources via MyAra\n• Māori and Pacific learning spaces\n\nThe library is open seven days a week from 7am until midnight, providing a supportive environment for your academic success.\n\nFor specific support with academic writing, maths skills, exam preparation, and study strategies, visit Learning Services on this floor.'
        }
      ]
    },
    {
      id: 'library-f1-1',
      imageUrl: '/360_photos_compressed/library/library_floor1_1.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 'library-f1-entrance' },
        forward: { connection: 'library-f1-2' },
        door: 'x-f1-mid-6-library',
        up: 'library-f2-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 3.75, y: -0.35, z: 2.5 },
          destination: 'x-f1-mid-6-library'
        },
        {
          direction: 'up',
          position: { x: -2, y: 0, z: 4 }  // Stairs
        },
        {
          direction: 'information',
          position: { x: -3.5, y: -0.2, z: -2.25 },
          title: 'The Library',
          description: 'Welcome to Ara\'s City Campus Library, your hub for learning, research, and study support.\n\nThe library offers:\n• Extensive book and journal collections\n• Quiet and collaborative study spaces\n• Computer stations and printing services\n• Research assistance from library staff\n• Learning Services support (located on floor 1)\n• StudySmart online resources via MyAra\n• Māori and Pacific learning spaces\n\nThe library is open seven days a week from 7am until midnight, providing a supportive environment for your academic success.\n\nFor specific support with academic writing, maths skills, exam preparation, and study strategies, visit Learning Services on this floor.'
        }
      ]
    },
    {
      id: 'library-f1-2',
      imageUrl: '/360_photos_compressed/library/library_floor1_2.webp',
      startingAngle: 190,
      directions: {
        back: { connection: 'library-f1-1' },
        forward: { connection: 'library-f1-3' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: 1, y: -0.2, z: -3 },
          title: 'The Library',
          description: 'Welcome to Ara\'s City Campus Library, your hub for learning, research, and study support.\n\nThe library offers:\n• Extensive book and journal collections\n• Quiet and collaborative study spaces\n• Computer stations and printing services\n• Research assistance from library staff\n• Learning Services support (located on floor 1)\n• StudySmart online resources via MyAra\n• Māori and Pacific learning spaces\n\nThe library is open seven days a week from 7am until midnight, providing a supportive environment for your academic success.\n\nFor specific support with academic writing, maths skills, exam preparation, and study strategies, visit Learning Services on this floor.'
        }
      ]
    },
    {
      id: 'library-f1-3',
      imageUrl: '/360_photos_compressed/library/library_floor1_3.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 'library-f1-2' },
        forward: { connection: 'library-f1-4' }
      }
    },
    {
      id: 'library-f1-4',
      imageUrl: '/360_photos_compressed/library/library_floor1_4.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 'library-f1-3' },
        right: { connection: 'library-f1-7' },
        forward: { connection: 'library-f1-5' }
      }
    },
    {
      id: 'library-f1-5',
      imageUrl: '/360_photos_compressed/library/library_floor1_5.webp',
      startingAngle: 180,
      directions: {
        right: { connection: 'library-f1-6' },
        back: { connection: 'library-f1-4' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -4, y: -0.2, z: -3 },
          title: 'Learning Services',
          description: 'Learning Services supports your academic success through personalized guidance and collaborative learning opportunities.\n\nServices Available:\n• One-on-one academic coaching\n• Academic writing and maths skills support\n• Study strategy development\n• Exam preparation and revision techniques\n• Stress management guidance\n• Tutor referrals\n\nResources & Programs:\n• StudySmart online tools (via MyAra)\n• Regular academic workshops\n• Quick Question drop-in sessions\n• PASS peer-assisted study groups\n• On-campus print resources\n\nSpecialist Support:\n• Māori and Pacific learning spaces with dedicated advisors\n• Open seven days a week, 7am - midnight\n\nOur advisors coach you to manage your study independently, strengthening essential skills through personalized support. Check the City campus Library or MyAra\'s Explore tile for workshop timetables and session schedules.'
        }
      ]
    },
    {
      id: 'library-f1-6',
      imageUrl: '/360_photos_compressed/library/library_floor1_6.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'library-f1-7' },
        right: { connection: 'library-f1-5' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: 4.5, y: -0.2, z: -0.5 },
          title: 'Learning Services',
          description: 'Learning Services supports your academic success through personalized guidance and collaborative learning opportunities.\n\nServices Available:\n• One-on-one academic coaching\n• Academic writing and maths skills support\n• Study strategy development\n• Exam preparation and revision techniques\n• Stress management guidance\n• Tutor referrals\n\nResources & Programs:\n• StudySmart online tools (via MyAra)\n• Regular academic workshops\n• Quick Question drop-in sessions\n• PASS peer-assisted study groups\n• On-campus print resources\n\nSpecialist Support:\n• Māori and Pacific learning spaces with dedicated advisors\n• Open seven days a week, 7am - midnight\n\nOur advisors coach you to manage your study independently, strengthening essential skills through personalized support. Check the City campus Library or MyAra\'s Explore tile for workshop timetables and session schedules.'
        },
        {
          direction: 'information',
          position: { x: -4, y: -0.25, z: 1.75 },
          title: 'L130 - The POD: 24-Hour Computing Suite',
          description: 'The POD is a 24-hour computing suite available to students at Ara\'s Christchurch City campus, located in the Library building (Rakaia Centre).\n\n24/7 Access:\n• Open 24 hours a day, 7 days a week\n• Computer stations available at all times\n• Perfect for late-night study sessions or early morning work\n\nAccess Requirements:\n• Current Student ID card required for after-hours access\n• Swipe card access on door locks outside normal library hours\n• Must abide by after-hours regulations in the Code of Conduct for ICT users\n\nOther Computing Suites:\nL247, L248, and L249 are also available during normal business hours (except when booked for classes).\n\nThe POD provides a dedicated space for students who need flexible access to computing resources at any time of day or night.'
        }
      ]
    },
    {
      id: 'library-f1-7',
      imageUrl: '/360_photos_compressed/library/library_floor1_7.webp',
      startingAngle: 180,
      directions: {
        right: { connection: 'library-f1-4' },
        back: { connection: 'library-f1-6' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: 4, y: -0.2, z: 2.5 },
          title: 'L130 - The POD: 24-Hour Computing Suite',
          description: 'The POD is a 24-hour computing suite available to students at Ara\'s Christchurch City campus, located in the Library building (Rakaia Centre).\n\n24/7 Access:\n• Open 24 hours a day, 7 days a week\n• Computer stations available at all times\n• Perfect for late-night study sessions or early morning work\n\nAccess Requirements:\n• Current Student ID card required for after-hours access\n• Swipe card access on door locks outside normal library hours\n• Must abide by after-hours regulations in the Code of Conduct for ICT users\n\nOther Computing Suites:\nL247, L248, and L249 are also available during normal business hours (except when booked for classes).\n\nThe POD provides a dedicated space for students who need flexible access to computing resources at any time of day or night.'
        }
      ]
    }
  ]
}
