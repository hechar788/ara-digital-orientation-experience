/**
 * X Block Floor 1 Area Definition
 *
 * Defines the main hallway on the ground floor of X Block, connecting the
 * east wing through the middle section to the west wing. The corridor
 * provides access to classrooms, offices, and other facilities.
 *
 * @fileoverview Contains route definition for X Block Floor 1 with
 * navigation connections, building context, and access points.
 */

import type { Area } from '../../../types/tour'

/**
 * X Block Floor 1 Main Corridor Route
 *
 * Covers the main hallway on the ground floor of X Block, connecting the
 * east wing through the middle section to the west wing. The corridor
 * provides access to classrooms, offices, and other facilities.
 *
 * Navigation flow:
 * East Wing → Middle Sections → West Wing
 *
 * Key features:
 * - Multi-wing layout with distinct sections
 * - Classroom and office access throughout
 * - Connection points to other floors via elevator
 * - Cross-building connection to A Block
 */
export const xBlockFloor1Area: Area = {
  id: 'x-block-floor-1-main',
  name: 'X Block',
  buildingBlock: 'x',
  floorLevel: 1,
  photos: [
    {
      id: 'x-f1-east-1',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_1.webp',
      startingAngle: 0,
      directions: {
        right: { connection: 'x-f1-east-2' },
        back: { connection: 'a-f1-south-6' },
        door: ['outside-x-south-entrance', 'outside-a-east-6']
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 4.5, y: -0.35, z: 0 },
          destination: 'outside-x-south-entrance'
        },
        {
          direction: 'door',
          position: { x: 0.5, y: -0.15, z: -5 },
          destination: 'outside-a-east-6'
        }
      ],
      buildingContext: {
        wing: 'east',
        facilities: ['classrooms', 'offices']
      }
    },
    {
      id: 'x-f1-east-2',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_2.webp',
      startingAngle: 25,
      directions: {
        forward: { connection: 'x-f1-east-3' },
        backRight: { connection: 'x-f1-east-1' },
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 2, y: 0, z: -3.5 }  // Stairs
        }
      ]
    },
    {
      id: 'x-f1-east-3',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_3.webp',
      startingAngle: 25,
      directions: {
        forward: { connection: 'x-f1-east-4' },
        back: { connection: 'x-f1-east-2' },
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: -4, y: -0.15, z: -4.25 }  // Stairs
        },
        {
          direction: 'information',
          position: { x: 4, y: 0, z: -3 },
          title: 'Coffee Infusion',
          description: 'Welcome to Coffee Infusion, the café in the heart of X Block!\n\nOur menu features:\n\n• Hot and iced drinks including coffee, hot chocolate, and matcha\n• Fresh food made daily\n• Sandwiches and wraps\n• Baked goods\n• Hot pies\n\nPerfect for a study break or catching up with friends!'
        }
      ]
    },
    {
      id: 'x-f1-east-4',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_east_4.webp',
      startingAngle: 25,
      directions: {
        forward: { connection: 'x-f1-mid-5' },
        back: { connection: 'x-f1-east-3' },
        up: 'x-f2-east-13'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: -5.25, y: -0.35, z: -7.5 }  // Stairs
        },
        {
          direction: 'information',
          position: { x: 2.75, y: 0, z: -5 },
          title: 'Coffee Infusion',
          description: 'Welcome to Coffee Infusion, the café in the heart of X Block!\n\nOur menu features:\n\n• Hot and iced drinks including coffee, hot chocolate, and matcha\n• Fresh food made daily\n• Sandwiches and wraps\n• Baked goods\n• Hot pies\n\nPerfect for a study break or catching up with friends!'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'Coffee Infusion',
          roomType: 'facility'
        }
      ]
    },
    {
      id: 'x-f1-mid-5',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_5.webp',
      startingAngle: 20,
      directions: {
        forward: { connection: 'x-f1-mid-6' },
        back: { connection: 'x-f1-east-4' }
      }
    },
    {
      id: 'x-f1-mid-6',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6.webp',
      startingAngle: 15,
      directions: {
        back: { connection: 'x-f1-mid-5' },
        forward: { connection: 'x-f1-mid-7' },
        right: { connection: 'x-f1-mid-6-library' },
        left: { connection: 'x-f1-mid-6-aside' },
        elevator: 'x-elevator-interior',
        door: 'library-f1-entrance'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -0.75, y: -0.5, z: -9 }  // Elevator
        },
        {
          direction: 'door',
          position: { x: -4.5, y: -0.15, z: 6.5 },
          destination: 'library-f1-entrance'
        },
        {
          direction: 'information',
          position: { x: 1.5, y: -0.125, z: 5 },
          title: 'Information Desk',
          description: 'Welcome to the Information Desk! Our friendly staff are here to help you with:\n\n• Campus directions and room locations\n• General inquiries about Ara services and facilities\n• Event information and campus activities\n• Visitor assistance\n• Quick questions about student services\n\nIf you\'re new to campus or need help finding your way around, stop by and say hello. We\'re here to make your campus experience as smooth as possible!'
        }
      ]
    },
    {
      id: 'x-f1-mid-6-library',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6_aside.webp',
      startingAngle: 90,
      directions: {
        back: { connection: 'x-f1-mid-6' },
        door: 'library-f1-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -2, y: -0.15, z: 1.35 },
          destination: 'library-f1-entrance'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'The Library',
          roomType: 'facility'
        }
    ]
    },
    {
      id: 'x-f1-mid-6-aside',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_6_aside_1.webp',
      startingAngle: 280,
      directions: {
        back: { connection: 'x-f1-mid-6' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -4, y: -1, z: 0 }  // Elevator
        },
        {
          direction: 'information',
          position: { x: 2, y: -0.125, z: -5 },
          title: 'Security Services',
          description: 'Your campus safety and support team!\n\nSecurity Services provides essential support for students:\n\n• Issue and renew student ID cards\n• Programme building access\n• On-campus safety support\n• Connect you with the right people if you\'re distressed or unsure what to do next\n\nFor immediate assistance or if you feel unsafe, call Ara Security on 027 540 8076 (Madras and Woolston campuses).\n\nWe\'re here to keep you safe and help you navigate any challenging situations.'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'Security Services',
          roomType: 'facility'
        }
      ]
    },
    {
      id: 'x-f1-mid-7',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_7.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'x-f1-mid-8' },
        back: { connection: 'x-f1-mid-6' },
        elevator: 'x-elevator-interior'
      },
      hotspots: [
        {
          direction: 'elevator',
          position: { x: -6, y: -0.35, z: -8 }  // Elevator
        },
        {
          direction: 'information',
          position: { x: 3.5, y: -0.15, z: 5 },
          title: 'L103 - Student Support',
          description: 'Student Support delivers holistic assistance to help you succeed:\n\n• Academic planning, policy navigation, advocacy for course or tutor issues, disability services, and assessment accommodations\n• Practical help with housing, finances, and Government agencies (StudyLink, Work and Income NZ)\n• Referrals for mental health, alcohol and drug support, emergency counselling, and family violence resources\n• Culturally grounded guidance for Māori and Pacific learners\n• International student advice\n\nOur comprehensive student services are designed to enhance your study success and support your wellbeing. In addition to the services listed above, you can talk to your tutor or any member of the Student Support team if you ever need advice or guidance. If they can\'t directly help, they\'ll connect you to someone who can.\n\nWe want you to enjoy your time at Ara and achieve your study goals. It\'s an investment in your future, and we\'ll do whatever we can to help you get the most out of it.'
        },
        {
          direction: 'information',
          position: { x: -2.25, y: -0.125, z: 4 },
          title: 'Information Desk',
          description: 'Welcome to the Information Desk! Our friendly staff are here to help you with:\n\n• Campus directions and room locations\n• General inquiries about Ara services and facilities\n• Event information and campus activities\n• Visitor assistance\n• Quick questions about student services\n\nIf you\'re new to campus or need help finding your way around, stop by and say hello. We\'re here to make your campus experience as smooth as possible!'
        },
        {
          direction: 'information',
          position: { x: 4, y: -0.1, z: -3.5 },
          title: 'The Hub',
          description: 'The Hub is your go-to destination for all things enrolment and qualifications!\n\nOur team can help you with:\n\n• Enrollments and registration\n• Requirements for certificates, diplomas, and postgraduate diplomas\n• Bachelor\'s degree information and prerequisites\n• Overview of all qualifications available at Ara\n• Course selection and programme planning\n• Entry requirements and pathways\n\nWhether you\'re just starting your journey or looking to advance your qualifications, The Hub team are here to guide you through your options and help you make informed decisions about your future study.'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'Information Desk',
          roomType: 'facility'
        }
    ]
    },
    {
      id: 'x-f1-mid-8',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_mid_8.webp',
      directions: {
        forward: { connection: 'x-f1-west-9' },
        back: { connection: 'x-f1-mid-7' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -1.35, y: -0.125, z: 5 },
          title: 'L103 - Student Support',
          description: 'Student Support delivers holistic assistance to help you succeed:\n\n• Academic planning, policy navigation, advocacy for course or tutor issues, disability services, and assessment accommodations\n• Practical help with housing, finances, and Government agencies (StudyLink, Work and Income NZ)\n• Referrals for mental health, alcohol and drug support, emergency counselling, and family violence resources\n• Culturally grounded guidance for Māori and Pacific learners\n• International student advice\n\nOur comprehensive student services are designed to enhance your study success and support your wellbeing. In addition to the services listed above, you can talk to your tutor or any member of the Student Support team if you ever need advice or guidance. If they can\'t directly help, they\'ll connect you to someone who can.\n\nWe want you to enjoy your time at Ara and achieve your study goals. It\'s an investment in your future, and we\'ll do whatever we can to help you get the most out of it.'
        },
        {
          direction: 'information',
          position: { x: -0.25, y: -0.05, z: -5 },
          title: 'The Hub',
          description: 'The Hub is your go-to destination for all things enrolment and qualifications!\n\nOur team can help you with:\n\n• Enrollments and registration\n• Requirements for certificates, diplomas, and postgraduate diplomas\n• Bachelor\'s degree information and prerequisites\n• Overview of all qualifications available at Ara\n• Course selection and programme planning\n• Entry requirements and pathways\n\nWhether you\'re just starting your journey or looking to advance your qualifications, The Hub team are here to guide you through your options and help you make informed decisions about your future study.'
        },
        {
          direction: 'information',
          position: { x: -6.5, y: -0.125, z: 2.85 },
          title: 'Information Desk',
          description: 'Welcome to the Information Desk! Our friendly staff are here to help you with:\n\n• Campus directions and room locations\n• General inquiries about Ara services and facilities\n• Event information and campus activities\n• Visitor assistance\n• Quick questions about student services\n\nIf you\'re new to campus or need help finding your way around, stop by and say hello. We\'re here to make your campus experience as smooth as possible!'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'L103 - Student Support',
          roomType: 'facility'
        },
        {
          roomNumber: 'The Hub',
          roomType: 'facility'
        }
      ]
    },
    {
      id: 'x-f1-west-9',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_9.webp',
      directions: {
        forward: { connection: 'x-f1-west-10' },
        back: { connection: 'x-f1-mid-8' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -5.5, y: -0.125, z: 2.75 },
          title: 'L103 - Student Support',
          description: 'Student Support delivers holistic assistance to help you succeed:\n\n• Academic planning, policy navigation, advocacy for course or tutor issues, disability services, and assessment accommodations\n• Practical help with housing, finances, and Government agencies (StudyLink, Work and Income NZ)\n• Referrals for mental health, alcohol and drug support, emergency counselling, and family violence resources\n• Culturally grounded guidance for Māori and Pacific learners\n• International student advice\n\nOur comprehensive student services are designed to enhance your study success and support your wellbeing. In addition to the services listed above, you can talk to your tutor or any member of the Student Support team if you ever need advice or guidance. If they can\'t directly help, they\'ll connect you to someone who can.\n\nWe want you to enjoy your time at Ara and achieve your study goals. It\'s an investment in your future, and we\'ll do whatever we can to help you get the most out of it.'
        },
        {
          direction: 'information',
          position: { x: -3.5, y: 0, z: -5 },
          title: 'The Hub',
          description: 'The Hub is your go-to destination for all things enrolment and qualifications!\n\nOur team can help you with:\n\n• Enrollments and registration\n• Requirements for certificates, diplomas, and postgraduate diplomas\n• Bachelor\'s degree information and prerequisites\n• Overview of all qualifications available at Ara\n• Course selection and programme planning\n• Entry requirements and pathways\n\nWhether you\'re just starting your journey or looking to advance your qualifications, The Hub team are here to guide you through your options and help you make informed decisions about your future study.'
        },
        {
          direction: 'information',
          position: { x: 3.575, y: -0.125, z: -5.75 },
          title: 'X110 - Student Finance',
          description: 'Student Finance is here to help you with all your financial needs at Ara.\n\nOur team can assist you with:\n\n• Student metro card applications and top-ups\n• Gym fee payments (for gym members)\n• Financial questions while studying at Ara\n• Course fee payments\n\nOur friendly team is here to guide you through the process and answer your questions.'
        }
      ]
    },
    {
      id: 'x-f1-west-10',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_10.webp',
      directions: {
        forward: { connection: 'x-f1-west-11' },
        back: { connection: 'x-f1-west-9' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -0.55, y: -0.125, z: -5 },
          title: 'X110 - Student Finance',
          description: 'Student Finance is here to help you with all your financial needs at Ara.\n\nOur team can assist you with:\n\n• Student metro card applications and top-ups\n• Gym fee payments (for gym members)\n• Financial questions while studying at Ara\n• Course fee payments\n\nOur friendly team is here to guide you through the process and answer your questions.'
        },
        {
          direction: 'information',
          position: { x: 3.5, y: -0.15, z: -2.55 },
          title: 'X108 - Careers & Employment',
          description: 'Need help with your next move?\n\nIf you need career advice, we recommend the [Tahatū Career Navigator](https://tahatu.govt.nz/) website. It\'s packed with great tools and tips to help plan your next steps.\n\nYou can also:\n\n• Book a chat with a careers advisor (call 0800 222733)\n• Email Student Support at learnersupport@ara.ac.nz if you\'re not sure where to start\n\nPlease note: There may be a wait for a 1:1 appointment with a careers advisor.'
        },
        {
          direction: 'information',
          position: { x: 6.75, y: -0.175, z: 0 },
          title: 'Ara Connect',
          description: 'Ara Connect offers self-paced computer skills training perfect for job seekers or anyone looking to improve their digital skills.\n\nWhat we offer:\n\n• Free computing courses from beginner to advanced\n• Word, Excel, PowerPoint, and more\n• Self-paced learning - drop in when it suits you\n• Evening and Saturday hours available\n• Friendly staff to help when you need it\n• Courses can lead to formal qualifications\n\nWhether you\'re job hunting or want to build your skills, Ara Connect is here to help you succeed!'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'X110 - Student Finance',
          roomType: 'facility'
        },
        {
          roomNumber: 'X108 - Careers & Employment',
          roomType: 'facility'
        }
      ]
    },
    {
      id: 'x-f1-west-11',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_11.webp',
      startingAngle: 0,
      directions: {
        back: { connection: 'x-f1-west-10' },
        forward: { connection: 'x-f1-west-12' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -2.45, y: -0.05, z: -2.5 },
          title: 'X108 - Careers & Employment',
          description: 'Need help with your next move?\n\nIf you need career advice, we recommend the [Tahatū Career Navigator](https://tahatu.govt.nz/) website. It\'s packed with great tools and tips to help plan your next steps.\n\nYou can also:\n\n• Book a chat with a careers advisor (call 0800 222733)\n• Email Student Support at learnersupport@ara.ac.nz if you\'re not sure where to start\n\nPlease note: There may be a wait for a 1:1 appointment with a careers advisor.'
        },
        {
          direction: 'information',
          position: { x: 2.85, y: -0.125, z: -1.75 },
          title: 'Ara Connect',
          description: 'Ara Connect offers self-paced computer skills training perfect for job seekers or anyone looking to improve their digital skills.\n\nWhat we offer:\n\n• Free computing courses from beginner to advanced\n• Word, Excel, PowerPoint, and more\n• Self-paced learning - drop in when it suits you\n• Evening and Saturday hours available\n• Friendly staff to help when you need it\n• Courses can lead to formal qualifications\n\nWhether you\'re job hunting or want to build your skills, Ara Connect is here to help you succeed!'
        }
      ],
      nearbyRooms: [
        {
          roomNumber: 'Ara Connect',
          roomType: 'facility'
        }
      ]
    },
    {
      id: 'x-f1-west-12',
      imageUrl: '/360_photos_compressed/x_block/floor_1/x_west_12.webp',
      startingAngle: 310,
      directions: {
        forward: { connection: 'n-f1-x-entry' },
        backLeft: { connection: 'x-f1-west-11' },
        up: 'x-f2-north-entry',
        door: 'outside-x-north-entrance'
      },
      hotspots: [
        {
          direction: 'up',
          position: { x: 1.95, y: -0.15, z: -5.5 }  // Stairs
        },
        {
          direction: 'door',
          position: { x: 4, y: -0.5, z: -0.275 },
          destination: 'outside-x-north-entrance'
        }
      ]
    }
  ]
}
