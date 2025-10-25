/**
 * Outside Area Definition
 *
 * Defines the exterior campus grounds and pathways connecting the various
 * building blocks. Provides outdoor navigation and orientation for the
 * overall campus layout.
 *
 * @fileoverview Contains route definition for outside areas with
 * navigation connections and building entrance access points.
 */

import type { Area } from '../../../types/tour'

/**
 * Outside Campus Area
 *
 * Covers the exterior campus grounds with pathways and building entrances.
 * Provides outdoor navigation between different building blocks and serves
 * as the primary orientation area for campus visitors.
 *
 * Navigation flow:
 * Building Entrances ↔ Campus Pathways ↔ Outdoor Spaces
 *
 * Key features:
 * - Outdoor pathways connecting building blocks
 * - Multiple building entrance access points
 * - Campus orientation and wayfinding
 * - Exterior architecture views
 */
export const outsideArea: Area = {
  id: 'outside-area',
  name: 'Outside',
  buildingBlock: 'outside',
  floorLevel: 0,
  photos: [
    {
      id: 'outside-x-north-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_x_north_entrance.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-x-north-1' },
        door: 'x-f1-west-12'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 6, y: -0.15, z: 0.7 },
          destination: 'x-f1-west-12'
        }
      ]
    },
    {
      id: 'outside-x-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_x_north_1.webp',
      startingAngle: 272.5,
      directions: {
        left: { connection: 'outside-x-north-2' },
        forwardRight: { connection: 'outside-g-mid-4' },
        back: { connection: 'outside-x-north-entrance' },
        door: 'x-f1-west-12'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -1.85, y: 0, z: 9 },
          destination: 'x-f1-west-12'
        }
      ]
    },
    {
      id: 'outside-x-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_x_north_2.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-n-north-1' },
        back: { connection: 'outside-x-north-1' }
      }
    },
    {
      id: 'outside-n-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-n-north-2' },
        right: { connection: 'outside-n-north-1-aside' },
        forwardLeft: { connection: 'outside-n-north-entrance' },
        back: { connection: 'outside-x-north-2' }
      }
    },
    {
      id: 'outside-n-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_2.webp',
      startingAngle: 170,
      directions: {
        forward: { connection: 'outside-s-north-1' },
        back: { connection: 'outside-n-north-1' }
      }
    },
    {
      id: 'outside-n-north-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_entrance.webp',
      startingAngle: 190,
      directions: {
        forwardRight: { connection: 'outside-s-north-entrance' },
        back: { connection: 'outside-n-north-1' },
        door: 'n-f1-mid-7'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -5.5, y: -0.3, z: -0.15 },
          destination: 'n-f1-mid-7'
        }
      ]
    },
    {
      id: 'outside-s-north-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_entrance.webp',
      directions: {
        forward: { connection: 'outside-s-north-1' },
        backRight: { connection: 'outside-n-north-entrance' },
        door: 'n-f1-mid-7'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -5, y: -0.3, z: -0.5 },
          destination: 'n-f1-mid-7'
        }
      ]
    },
    {
      id: 'outside-s-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-2' },
        back: { connection: 'outside-n-north-2' },
        backLeft: { connection: 'outside-s-north-entrance' },
        forwardRight: { connection: 'outside-s-north-1-aside' },
        door: 'n-f1-mid-7'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 4.15, y: 0.25, z: 8 },
          destination: 'n-f1-mid-7'
        }
      ]
    },
    {
      id: 'outside-s-north-1-aside',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_1_aside.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-1-aside-1' },
        back: { connection: 'outside-s-north-1' },
      }
    },
    {
      id: 'outside-s-north-1-aside-1',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_1_aside_1.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-s-north-1-aside-2' },
        back: { connection: 'outside-s-north-1-aside' },
      }
    },
    {
      id: 'outside-s-north-1-aside-2',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_1_aside_2.webp',
      startingAngle: 180,
      directions: {
        forwardLeft: { connection: 'outside-u-mid-3' },
        forwardRight: { connection: 'outside-u-mid-4' },
        back: { connection: 'outside-s-north-1-aside-1' },
      }
    },


    {
      id: 'outside-n-north-1-aside',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1_aside.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'outside-n-north-1-aside-1' },
        back: { connection: 'outside-n-north-1' }
      }
    },
    {
      id: 'outside-n-north-1-aside-1',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1_aside_1.webp',
      startingAngle: 10,
      directions: {
        forward: { connection: 'outside-n-north-1-aside-2' },
        back: { connection: 'outside-n-north-1-aside' }
      }
    },
    {
      id: 'outside-n-north-1-aside-2',
      imageUrl: '/360_photos_compressed/outside/outside_n_north_1_aside_2.webp',
      startingAngle: 0,
      directions: {
        forward: { connection: 'outside-g-mid-1' },
        back: { connection: 'outside-n-north-1-aside-1' }
      }
    },
    {
      id: 'outside-s-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-3' },
        back: { connection: 'outside-s-north-1' }
      }
    },
    {
      id: 'outside-s-north-3',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_3.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-north-4' },
        forwardRight: { connection: 'outside-u-mid-1' },
        backLeft: { connection: 'outside-s-north-2' }
      }
    },
    {
      id: 'outside-u-mid-1',
      imageUrl: '/360_photos_compressed/outside/outside_u_mid_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-u-mid-2' },
        back: { connection: 'outside-s-north-3' }
      }
    },
    {
      id: 'outside-u-mid-2',
      imageUrl: '/360_photos_compressed/outside/outside_u_mid_2.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-u-mid-3' },
        back: { connection: 'outside-u-mid-1' }
      }
    },
    {
      id: 'outside-u-mid-3',
      imageUrl: '/360_photos_compressed/outside/outside_u_mid_3.webp',
      startingAngle: 200,
      directions: {
        forward: { connection: 'outside-u-mid-4' },
        forwardRight: { connection: 'outside-s-north-1-aside-2' },
        back: { connection: 'outside-u-mid-2' }
      }
    },
    {
      id: 'outside-u-mid-4',
      imageUrl: '/360_photos_compressed/outside/outside_u_mid_4.webp',
      startingAngle: 168.5,
      directions: {
        forward: { connection: 'outside-u-mid-5' },
        back: { connection: 'outside-u-mid-3' },
        backRight: { connection: 'outside-s-north-1-aside-2' }
      }
    },
    {
      id: 'outside-u-mid-5',
      imageUrl: '/360_photos_compressed/outside/outside_u_mid_5.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 'outside-t-mid-1' },
        back: { connection: 'outside-u-mid-4' }
      }
    },
    {
      id: 'outside-t-mid-1',
      imageUrl: '/360_photos_compressed/outside/outside_t_mid_1.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-t-mid-2' },
        back: { connection: 'outside-u-mid-5' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -5.25, y: -0.25, z: -0.9 },
          title: 'ICT Service Desk',
          description: 'The ICT Service Desk provides technical support and assistance for all your computing needs at Ara.\n\nServices include:\n\n• Computer and device troubleshooting\n• Software installation and support\n• Network and Wi-Fi connectivity help\n• Password resets and account access\n• Printing and scanning assistance\n• Student ID card programming for building access\n• MyAra portal support\n• Email and Microsoft 365 help\n\nOur friendly ICT team is here to help you stay connected and make the most of Ara\'s technology resources. Visit us in T Block or contact the service desk for technical assistance.'
        }
      ]
    },
    {
      id: 'outside-t-mid-2',
      imageUrl: '/360_photos_compressed/outside/outside_t_mid_2.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 'outside-t-mid-3' },
        back: { connection: 'outside-t-mid-1' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: 2.5, y: -0.2, z: 2.5 },
          title: 'ICT Service Desk',
          description: 'The ICT Service Desk provides technical support and assistance for all your computing needs at Ara.\n\nServices include:\n\n• Computer and device troubleshooting\n• Software installation and support\n• Network and Wi-Fi connectivity help\n• Password resets and account access\n• Printing and scanning assistance\n• Student ID card programming for building access\n• MyAra portal support\n• Email and Microsoft 365 help\n\nOur friendly ICT team is here to help you stay connected and make the most of Ara\'s technology resources. Visit us in T Block or contact the service desk for technical assistance.'
        }
      ]
    },
    {
      id: 'outside-t-mid-3',
      imageUrl: '/360_photos_compressed/outside/outside_t_mid_3.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-g-mid-1' },
        backLeft: { connection: 'outside-t-mid-2' }
      }
    },
    {
      id: 'outside-g-mid-1',
      imageUrl: '/360_photos_compressed/outside/outside_g_mid_1.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-g-mid-2' },
        right: { connection: 'outside-n-north-1-aside-2' },
        back: { connection: 'outside-t-mid-3' }
      }
    },
    {
      id: 'outside-g-mid-2',
      imageUrl: '/360_photos_compressed/outside/outside_g_mid_2.webp',
      startingAngle: 185.5,
      directions: {
        forward: { connection: 'outside-g-mid-3' },
        back: { connection: 'outside-g-mid-1' }
      }
    },
    {
      id: 'outside-g-mid-3',
      imageUrl: '/360_photos_compressed/outside/outside_g_mid_3.webp',
      startingAngle: 195,
      directions: {
        forward: { connection: 'outside-g-mid-4' },
        back: { connection: 'outside-g-mid-2' }
      }
    },
    {
      id: 'outside-g-mid-4',
      imageUrl: '/360_photos_compressed/outside/outside_g_mid_4.webp',
      startingAngle: 183.5,
      directions: {
        forwardLeft: { connection: 'outside-g-mid-5' },
        right: { connection: 'outside-x-north-1' },
        back: { connection: 'outside-g-mid-3' }
      }
    },
    {
      id: 'outside-g-mid-5',
      imageUrl: '/360_photos_compressed/outside/outside_g_mid_5.webp',
      startingAngle: 187.5,
      directions: {
        forward: { connection: 'outside-tm-1' },
        right: { connection: 'outside-g-mid-4' }
      }
    },
    {
      id: 'outside-tm-1',
      imageUrl: '/360_photos_compressed/outside/outside_tm_1.webp',
      startingAngle: 200,
      directions: {
        forward: { connection: 'outside-tm-2' },
        back: { connection: 'outside-g-mid-5' }
      }
    },
    {
      id: 'outside-tm-2',
      imageUrl: '/360_photos_compressed/outside/outside_tm_2.webp',
      startingAngle: 188.5,
      directions: {
        forward: { connection: 'outside-tm-3' },
        back: { connection: 'outside-tm-1' }
      }
    },
    {
      id: 'outside-tm-3',
      imageUrl: '/360_photos_compressed/outside/outside_tm_3.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-a-north-1' },
        back: { connection: 'outside-tm-2' }
      }
    },
    {
      id: 'outside-a-north-1',
      imageUrl: '/360_photos_compressed/outside/outside_a_north_1.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 'outside-a-north-2' },
        back: { connection: 'outside-tm-3' },
        door: 'a-f1-north-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 0.3, y: -0.2, z: -5.5 },
          destination: 'a-f1-north-entrance'
        }
      ]
    },
    {
      id: 'outside-a-north-2',
      imageUrl: '/360_photos_compressed/outside/outside_a_north_2.webp',
      startingAngle: 192.5,
      directions: {
        forward: { connection: 'outside-a-north-3' },
        back: { connection: 'outside-a-north-1' },
        door: 'a-f1-north-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 7.85, y: -0.2, z: -4.5 },
          destination: 'a-f1-north-entrance'
        }
      ]
    },
    {
      id: 'outside-a-north-3',
      imageUrl: '/360_photos_compressed/outside/outside_a_north_3.webp',
      startingAngle: 183.5,
      directions: {
        forward: { connection: 'outside-a-north-4' },
        back: { connection: 'outside-a-north-2' }
      }
    },
    {
      id: 'outside-a-north-4',
      imageUrl: '/360_photos_compressed/outside/outside_a_north_4.webp',
      startingAngle: 180,
      directions: {
        right: { connection: 'outside-a-east-1' },
        left: { connection: 'outside-w-west-1' },
        back: { connection: 'outside-a-north-3' }
      }
    },
    {
      id: 'outside-a-east-1',
      imageUrl: '/360_photos_compressed/outside/outside_a_east_1.webp',
      startingAngle: 187.5,
      directions: {
        forward: { connection: 'outside-a-east-2' },
        back: { connection: 'outside-a-north-4' },
        backRight: { connection: 'outside-a-north-3' }
      }
    },
    {
      id: 'outside-a-east-2',
      imageUrl: '/360_photos_compressed/outside/outside_a_east_2.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 'outside-a-east-3' },
        back: { connection: 'outside-a-east-1' }
      }
    },
    {
      id: 'outside-a-east-3',
      imageUrl: '/360_photos_compressed/outside/outside_a_east_3.webp',
      startingAngle: 180,
      directions: {
        forwardRight: { connection: 'outside-a-east-4' },
        back: { connection: 'outside-a-east-2' }
      }
    },
    {
      id: 'outside-a-east-4',
      imageUrl: '/360_photos_compressed/outside/outside_a_east_4.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-a-east-5' },
        backLeft: { connection: 'outside-a-east-3' }
      }
    },
    {
      id: 'outside-a-east-5',
      imageUrl: '/360_photos_compressed/outside/outside_a_east_5.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 'outside-a-east-6' },
        back: { connection: 'outside-a-east-4' }
      }
    },
    {
      id: 'outside-a-east-6',
      imageUrl: '/360_photos_compressed/outside/outside_a_east_6.webp',
      startingAngle: 120,
      directions: {
        forwardLeft: { connection: 'outside-cafeteria-1' },
        forwardRight: { connection: 'outside-cafeteria-7' },
        back: { connection: 'outside-a-east-5' },
        door: 'x-f1-east-1'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -5, y: -0.3, z: -0.25 },
          destination: 'x-f1-east-1'
        }
      ]
    },
    {
      id: 'outside-cafeteria-1',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_1.webp',
      startingAngle: 350,
      directions: {
        forward: { connection: 'outside-cafeteria-2' },
        forwardRight: { connection: 'outside-cafeteria-6' },
        back: { connection: 'outside-a-east-6' }
      }
    },
    {
      id: 'outside-cafeteria-2',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_2.webp',
      startingAngle: 15,
      directions: {
        forward: { connection: 'outside-cafeteria-3' },
        backRight: { connection: 'outside-cafeteria-6' },
        back: { connection: 'outside-cafeteria-1' }
      }
    },
    {
      id: 'outside-cafeteria-6',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_6.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-cafeteria-6-aside' },
        back: { connection: 'outside-cafeteria-1' },
        left: { connection: 'outside-cafeteria-8' },
        right: { connection: 'outside-cafeteria-7' }
      }
    },
    {
      id: 'outside-cafeteria-6-aside',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_6_aside.webp',
      startingAngle: 160,
      directions: {
        back: { connection: 'outside-cafeteria-6' }
      }
    },
    {
      id: 'outside-cafeteria-8',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_8.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-x-south-entrance' },
        right: { connection: 'outside-cafeteria-6' }
      }
    },
    {
      id: 'outside-x-south-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_x_south_entrance.webp',
      startingAngle: 100,
      directions: {
        back: { connection: 'outside-cafeteria-8' },
        door: 'x-f1-east-1'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -7, y: -0.2, z: -1.175 },
          destination: 'x-f1-east-1'
        }
      ]
    },
    {
      id: 'outside-cafeteria-7',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_7.webp',
      startingAngle: 195,
      directions: {
        forward: { connection: 'outside-cafeteria-6' },
        backLeft: { connection: 'outside-a-east-6' }
      }
    },
    {
      id: 'outside-cafeteria-3',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_3.webp',
      startingAngle: 355,
      directions: {
        forward: { connection: 'outside-cafeteria-4' },
        back: { connection: 'outside-cafeteria-2' },
        door: 'inside-student-lounge'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 0.5, y: -0.25, z: -3 },
          destination: 'inside-student-lounge'
        }
      ]
    },
    {
      id: 'outside-cafeteria-4',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_4.webp',
      startingAngle: 6.5,
      directions: {
        forward: { connection: 'outside-cafeteria-5' },
        back: { connection: 'outside-cafeteria-3' }
      }
    },
    {
      id: 'outside-cafeteria-5',
      imageUrl: '/360_photos_compressed/outside/outside_cafeteria_5.webp',
      startingAngle: 0,
      directions: {
        forward: { connection: 'student-lounge-madras-street-entrance' },
        back: { connection: 'outside-cafeteria-4' }
      }
    },
    {
      id: 'student-lounge-madras-street-entrance',
      imageUrl: '/360_photos_compressed/student_lounge/madras_street_entrance.webp',
      startingAngle: 280,
      directions: {
        back: { connection: 'outside-cafeteria-5' }
      }
    },
    {
      id: 'outside-w-west-1',
      imageUrl: '/360_photos_compressed/outside/outside_w_west_1.webp',
      startingAngle: 197.5,
      directions: {
        forward: { connection: 'outside-w-west-2' },
        back: { connection: 'outside-a-north-4' }
      }
    },
    {
      id: 'outside-w-west-2',
      imageUrl: '/360_photos_compressed/outside/outside_w_west_2.webp',
      startingAngle: 190,
      directions: {
        forward: { connection: 'outside-w-west-3' },
        right: { connection: 'outside-w-entrance' },
        back: { connection: 'outside-w-west-1' },
        door: 'w-f1-main-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: 1.5, y: -0.2, z: -9.5 },
          destination: 'w-f1-main-entrance'
        }
      ]
    },
    {
      id: 'outside-w-entrance',
      imageUrl: '/360_photos_compressed/outside/outside_w_entrance.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 'outside-w-west-2' },
        door: 'w-f1-main-entrance'
      },
      hotspots: [
        {
          direction: 'door',
          position: { x: -6.5, y: -0.2, z: -0.65 },
          destination: 'w-f1-main-entrance'
        }
      ]
    },
    {
      id: 'outside-w-west-3',
      imageUrl: '/360_photos_compressed/outside/outside_w_west_3.webp',
      startingAngle: 187.5,
      directions: {
        forward: { connection: 'outside-w-west-4' },
        back: { connection: 'outside-w-west-2' }
      }
    },
    {
      id: 'outside-w-west-4',
      imageUrl: '/360_photos_compressed/outside/outside_w_west_4.webp',
      startingAngle: 185,
      directions: {
        forward: { connection: 'outside-w-west-5' },
        back: { connection: 'outside-w-west-3' }
      }
    },
    {
      id: 'outside-w-west-5',
      imageUrl: '/360_photos_compressed/outside/outside_w_west_5.webp',
      startingAngle: 180,
      directions: {
        back: { connection: 'outside-w-west-4' }
      }
    },
    {
      id: 'outside-s-north-4',
      imageUrl: '/360_photos_compressed/outside/outside_s_north_4.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-5' },
        back: { connection: 'outside-s-north-3' }
      }
    },
    {
      id: 'outside-s-east-5',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_5.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-6' },
        back: { connection: 'outside-s-north-4' }
      },
      hotspots: [
        {
          direction: 'information',
          position: { x: -4.35, y: -0.075, z: -3.7 },
          tabs: [
            {
              title: 'The Pantry',
              description: 'The Pantry on Campus is a café where food is prepared and packed to sell by chef and bakery students.\n\nThey offer great value food for snacks and lunches and make coffee to go. As The Pantry is used as part of teaching, you will find different choices each day.\n\nCome in and see what they have to offer!'
            },
            {
              title: 'Visions Restaurant',
              description: 'Visions is a fully licensed restaurant at the City campus where you can enjoy a unique dining experience provided by up-and-coming hospitality professionals.\n\nStudents studying cookery, hospitality and hospitality management programmes are involved in all aspects of your dining experience, from preparing and serving your meal to managing the restaurant and operating the bar with its substantial wine and beverage list.\n\nThe restaurant offers vegetarian, vegan and gluten-free options, with menus that may change throughout the year based on the season and teaching requirements.\n\nIt\'s an ideal place to dine with family, friends or colleagues and to celebrate special occasions.'
            }
          ]
        }
      ]
    },
    {
      id: 'outside-s-east-6',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_6.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-7' },
        back: { connection: 'outside-s-east-5' }
      }
    },
    {
      id: 'outside-s-east-7',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_7.webp',
      startingAngle: 180,
      directions: {
        forward: { connection: 'outside-s-east-8' },
        back: { connection: 'outside-s-east-6' }
      }
    },
    {
      id: 'outside-s-east-8',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_8.webp',
      startingAngle: 175,
      directions: {
        forward: { connection: 'outside-s-east-9' },
        back: { connection: 'outside-s-east-7' }
      }
    },
    {
      id: 'outside-s-east-9',
      imageUrl: '/360_photos_compressed/outside/outside_s_east_9.webp',
      startingAngle: 95,
      directions: {
        back: { connection: 'outside-s-east-8' }
      }
    }
  ]
}
