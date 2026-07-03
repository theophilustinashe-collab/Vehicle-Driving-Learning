import { db, questionsTable } from '../lib/db/src/index.ts';

async function addQuestions() {
  console.log("🚀 Adding new questions to the database...");

  const newQuestions = [
    // --- Test 1 ---
    {
      text: "Which car has the right of way?",
      options: ["Car C", "Car B", "Car A"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question: Usually Car A is on the major road or to the right.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car gives right of way?",
      options: ["Car C", "Car B", "Car A"],
      correctAnswer: 1,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question: The car on the minor road or turning across traffic must yield.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car should stop? (A traffic circle)",
      options: ["Car A", "Car C", "Car B"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question: Cars entering the traffic circle must yield to those already inside.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car gives right of way?",
      options: ["Car B", "Car C", "Car A"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car gives right of way?",
      options: ["Car A", "Car B", "Car C"],
      correctAnswer: 1,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car is breaking the law assuming both are moving?",
      options: ["Car B", "Car A", "Car C"],
      correctAnswer: 0,
      category: "Rules",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "The sign indicates:",
      options: ["Hospital ahead.", "End of speed restriction", "Broken down vehicle ahead"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "easy",
      explanation: "A square blue sign with a white 'H' or a red cross indicates a hospital.",
      imageUrl: "sign_needed"
    },
    {
      text: "When approaching this sign, I should:",
      options: ["Disengage gears.", "Engage a lower gear", "Apply hand brake"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "medium",
      explanation: "For steep descents or hazards, engaging a lower gear provides better engine braking and control.",
      imageUrl: "sign_needed"
    },
    {
      text: "The sign indicates I am:",
      options: ["Permitted to make a 'U' turn", "Prohibited from making a 'U' turn", "Prohibited from turning right"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "easy",
      explanation: "A red circle with a 'U' and a diagonal slash means No U-turn.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign indicates:",
      options: ["Width restriction", "Height restriction", "Cattle ahead"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "medium",
      explanation: "Signs with arrows pointing top and bottom indicate height restrictions.",
      imageUrl: "sign_needed"
    },
    {
      text: "At this sign I should:",
      options: ["Stop, and only proceed when the road is clear on both sides", "Stop, and only proceed when the road is clear on the right", "Stop, and only proceed when the road is clear on the left"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "medium",
      explanation: "At a stop sign, you must ensure the road is clear from both directions before proceeding.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign indicates that I:",
      options: ["May not park my vehicle", "May park my vehicle", "Expect 'Lay-by' ahead"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "easy",
      explanation: "A red circle with a blue background and a red diagonal slash means No Parking.",
      imageUrl: "sign_needed"
    },
    {
      text: "A heavy vehicle may tow not more than:",
      options: ["One trailer", "Three trailers", "Two trailers"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
      explanation: "In Zimbabwe, heavy vehicles are restricted to towing a maximum of two trailers.",
    },
    {
      text: "When carrying a passenger on my motorcycle, I must:",
      options: ["Have headlamps fitted", "Have the petrol tank filled", "Have a pillion and foot rests firmly fixed"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
      explanation: "Safety regulations require a proper seat (pillion) and footrests for any passenger on a motorcycle.",
    },
    {
      text: "If involved in a SERIOUS accident, I must:",
      options: ["Report to a hospital", "Report to police within 48 hours", "Report to police as soon as possible, or within 24 hours."],
      correctAnswer: 2,
      category: "Legal",
      difficulty: "hard",
      explanation: "All accidents involving injury or serious damage must be reported to the police within 24 hours.",
    },
    {
      text: "When traveling behind another vehicle at night, I must:",
      options: ["Dip my headlamps", "Switch on my sidelights", "Drive slowly"],
      correctAnswer: 0,
      category: "Safety",
      difficulty: "easy",
      explanation: "You must dip your headlamps to avoid dazzling the driver in front of you.",
    },
    {
      text: "When should a horn be used?",
      options: ["To attract a friend's attention", "When warning another road user.", "When cattle are blocking the road ahead"],
      correctAnswer: 1,
      category: "Rules",
      difficulty: "easy",
      explanation: "The horn should only be used to warn other road users of your presence or a potential danger.",
    },
    {
      text: "I may park no closer to a corner than:",
      options: ["9.5 meters", "15 meters", "7.5 meters"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
      explanation: "Parking within 7.5 meters of a corner or intersection is prohibited.",
    },
    {
      text: "At an intersection with a flashing amber robot, I would:",
      options: ["Wait until the road ahead is clear", "Give right of way to vehicles from the left", "Give right of way to vehicles from the right"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "A flashing amber light means you must proceed with caution and give way to traffic from your right.",
    },
    {
      text: "In which circumstances would I proceed against a red robot?",
      options: ["When the green arrow is illuminated", "When there is no approaching traffic", "When the road is clear on the right"],
      correctAnswer: 0,
      category: "Traffic Lights",
      difficulty: "medium",
      explanation: "You may only proceed past a red light if a green filter arrow is illuminated for your direction.",
    },
    {
      text: "Which is the correct robot light sequence?",
      options: ["Red, Amber, Green", "Red, Green, Amber", "Green, Red, Amber"],
      correctAnswer: 1,
      category: "Traffic Lights",
      difficulty: "medium",
      explanation: "The standard sequence is Red, then Green, then Amber (warning it is about to turn Red).",
    },
    {
      text: "A driver sees a continuous white line in the centre of the road, he or she:",
      options: ["May cross if there is no oncoming traffic", "May not cross", "May cross in rural areas"],
      correctAnswer: 1,
      category: "Road Markings",
      difficulty: "easy",
      explanation: "A continuous white line must not be crossed for the purpose of overtaking.",
    },
    {
      text: "A broken white line beside a continuous white line in the centre of the road indicates that:",
      options: ["I may overtake if the continuous white line is on my side", "I may overtake if the broken line is on my side", "I must keep well left"],
      correctAnswer: 1,
      category: "Road Markings",
      difficulty: "medium",
      explanation: "You may only cross the lines to overtake if the broken line is on your side of the road.",
    },
    {
      text: "A broken yellow line on the left hand side of the road indicates:",
      options: ["It may not be straddled", "It may be straddled to overtake traffic which is turning right", "It may be straddled to overtake cyclists"],
      correctAnswer: 1,
      category: "Road Markings",
      difficulty: "medium",
      explanation: "The yellow 'shoulder' line can be straddled to allow others to pass or to overtake vehicles turning right when safe.",
    },
    {
      text: "What must you do when meeting a motor vehicle displaying 'L' plates?",
      options: ["Hoot if the vehicle is blocking your path", "Exercise extreme caution", "Flash my headlights"],
      correctAnswer: 1,
      category: "Safety",
      difficulty: "easy",
      explanation: "Always give learner drivers extra space and patience.",
    },

    // --- Test 2 ---
    {
      text: "Which car goes last?",
      options: ["Car C", "Car A", "Car B"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car is breaking the law assuming vehicles are moving?",
      options: ["Car A", "Car C", "Car B"],
      correctAnswer: 1,
      category: "Rules",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "This sign indicates?",
      options: ["Railway station", "Rail-road level crossing", "An intersection"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "easy",
      explanation: "The X-shaped crossbuck or train symbol indicates a level crossing.",
      imageUrl: "sign_needed"
    },
    {
      text: "The driver may not park closer to the corner than:",
      options: ["6.5m", "7m", "7.5m"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
      explanation: "Parking within 7.5 meters of an intersection is prohibited.",
    },
    {
      text: "Cyclists should ride:",
      options: ["As many as possible abreast", "Two abreast", "Single file."],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "easy",
      explanation: "For safety, cyclists should ride in a single line.",
    },
    {
      text: "When facing a red robot with an illuminated straight ahead Green arrow, I may:",
      options: ["Proceed straight ahead", "Turn right should I wish", "Not proceed"],
      correctAnswer: 0,
      category: "Traffic Lights",
      difficulty: "medium",
      explanation: "A green arrow allows you to proceed in that specific direction even if the main light is red.",
    },
    {
      text: "Which is the correct light sequence at a robot?",
      options: ["Amber, Red, Green", "Red, Amber, Green", "Green, Red, Amber"],
      correctAnswer: 1,
      category: "Traffic Lights",
      difficulty: "medium",
      explanation: "Red (Stop), Green (Go), Amber (Prepare to stop).",
    },
    {
      text: "A continuous white line in the center of the road may:",
      options: ["Be crossed if the road ahead is clear", "Not be crossed for the purposes of overtaking", "Be crossed only on highways"],
      correctAnswer: 1,
      category: "Road Markings",
      difficulty: "easy",
      explanation: "You must not cross a solid white line to overtake.",
    },
    {
      text: "Direction arrows used in conjunction with prohibition lines on a road surface:",
      options: ["Are for information purposes only", "Relate to taxi drivers only", "Have a regulatory effect"],
      correctAnswer: 2,
      category: "Road Markings",
      difficulty: "medium",
      explanation: "Arrows on the road indicating direction are mandatory (regulatory) to follow.",
    },
    {
      text: "Which cars can move without breaking the law?",
      options: ["Car A and Car C", "Car B only", "Both Car A and B"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "I should always yield right of way to:",
      options: ["Ambulance and fire engine sounding a siren", "Presidential motorcade", "All of the above"],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "easy",
      explanation: "Emergency vehicles with sirens and official motorcades have absolute right of way.",
    },
    {
      text: "This sign indicates?",
      options: ["Danger of stray animals", "Danger of wild animals", "Danger of farm animals"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "easy",
      explanation: "A sign with a cow symbol warns of domestic/stray animals.",
      imageUrl: "sign_needed"
    },
    {
      text: "A solid yellow line on the left hand side of the road indicates:",
      options: ["It may be straddled to overtake traffic which is turning right", "It may be straddled to overtake cyclists", "It may not be straddled"],
      correctAnswer: 2,
      category: "Road Markings",
      difficulty: "medium",
      explanation: "A solid yellow line on the edge of the road generally means no stopping or straddling is allowed.",
    },
    {
      text: "This sign indicates?",
      options: ["Hump ahead", "Dip or ridge ahead", "Mountains ahead"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "easy",
      explanation: "A sign with a wavy line indicates uneven road surfaces like dips or ridges.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign means that:",
      options: ["Rail road level crossing ahead", "Traffic lights and rail road crossing ahead", "Traffic lights out of order"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "medium",
      explanation: "Diagram-based sign warning.",
      imageUrl: "sign_needed"
    },
    {
      text: "Which car stops?",
      options: ["Car A", "Car B", "Car C"],
      correctAnswer: 1,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car moves last at this intersection?",
      options: ["Car B", "Car A", "Car C"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car goes last?",
      options: ["Car C", "Car B", "Car A"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "When traveling at 90km/h I must leave a gap of:",
      options: ["Six vehicle lengths", "Five vehicle lengths", "Seven vehicle lengths"],
      correctAnswer: 0,
      category: "Safety",
      difficulty: "hard",
      explanation: "One vehicle length for every 15km/h of speed (90/15 = 6).",
    },
    {
      text: "When approaching a give way sign:",
      options: ["I am obliged to stop before proceeding", "I am obliged to give way to traffic approaching the intersection on my right only", "I may proceed with caution and without stopping provided there is no other traffic"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Unlike a stop sign, you only need to stop if there is traffic to yield to.",
    },
    {
      text: "I must dip my headlamps:",
      options: ["When approaching a railway level crossing.", "When driving in a well lit area", "When approaching an urban area"],
      correctAnswer: 1,
      category: "Safety",
      difficulty: "medium",
      explanation: "Use low beams in areas with sufficient street lighting.",
    },
    {
      text: "In rural areas where traffic is not controlled, I should give precedence to:",
      options: ["Traffic approaching from a road on the left.", "Traffic approaching from a road on the right.", "Traffic already in the intersection regardless of which side it is coming from"],
      correctAnswer: 1,
      category: "Intersections",
      difficulty: "medium",
      explanation: "The basic rule is to give way to traffic from your right.",
    },
    {
      text: "The insignia of a warning sign is:",
      options: ["A triangle", "A circle", "A rectangle"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "easy",
      explanation: "Warning signs are always triangular with the apex pointing up.",
    },
    {
      text: "When approaching a narrow bridge, I must pay attention to:",
      options: ["Height restriction", "Length restriction", "Width restriction"],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "easy",
      explanation: "Narrow bridges require checking if your vehicle's width can pass safely.",
    },
    {
      text: "At a robot-controlled intersection where you have stopped over the pedestrian crossing lines, what do you do:",
      options: ["Decide to carry on", "Reverse the vehicle", "Stay where you are"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
      explanation: "Reversing or moving forward when not safe is dangerous; stay stationary if you are already over the line but blocked.",
    },

    // --- Test 3 ---
    {
      text: "Before driving a motor vehicle on a public road, it must have the following:",
      options: ["Certificate of fitness and a repair card.", "Learner's licence.", "Registration book, insurance and a vehicle licence."],
      correctAnswer: 2,
      category: "Legal",
      difficulty: "medium",
      explanation: "All vehicles must be registered, insured, and licensed to be on public roads.",
    },
    {
      text: "The correct sequence of a robot traffic light is:",
      options: ["Amber, Green, Red.", "Green, Amber, Red.", "Red, Amber, Green"],
      correctAnswer: 2,
      category: "Traffic Lights",
      difficulty: "medium",
      explanation: "The standard sequence is Red, then Amber (shortly before Green), then Green.",
    },
    {
      text: "When approaching a pedestrian crossing you:",
      options: ["Sound the horn.", "Accelerate quickly over it.", "Slow down and prepare to stop."],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "easy",
      explanation: "Always be ready to stop for pedestrians.",
    },
    {
      text: "For cyclists not to interfere with other road users they should ride:",
      options: ["Two to three abreast.", "Single file.", "Completely off the road."],
      correctAnswer: 1,
      category: "Rules",
      difficulty: "easy",
      explanation: "Single file is the safest way for cyclists to ride on public roads.",
    },
    {
      text: "A heavy vehicle towing independent trailers must have:",
      options: ["Safety chains fitted to the trailers.", "More pulling power.", "As many spare wheels as possible."],
      correctAnswer: 0,
      category: "Safety",
      difficulty: "medium",
      explanation: "Safety chains prevent trailers from detaching completely if the hitch fails.",
    },
    {
      text: "When approaching a slow moving combine harvester going in my direction of travel:",
      options: ["I increase speed and overtake it", "I slow down and give it space to pass", "I slow down and keep behind until its safe to overtake"],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "medium",
      explanation: "Patience is key when dealing with slow, wide agricultural machinery.",
    },
    {
      text: "To drive a heavy vehicle you must have reached the age of:",
      options: ["Nineteen years.", "Eighteen years.", "Seventeen years."],
      correctAnswer: 1,
      category: "Legal",
      difficulty: "medium",
      explanation: "The minimum age for heavy vehicle licenses is 18.",
    },
    {
      text: "Which car moves second at this intersection?",
      options: ["Car A", "Car B", "Car C"],
      correctAnswer: 1,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car moves first at this intersection?",
      options: ["Car A", "Car B", "Car C"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car stops?",
      options: ["Car A", "Car B", "Car C"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "This sign warns of:",
      options: ["Cross road ahead.", "Rail and level crossing ahead.", "Stop or give way sign ahead."],
      correctAnswer: 2,
      category: "Signs",
      difficulty: "medium",
      explanation: "Diagram-based sign warning.",
      imageUrl: "sign_needed"
    },
    {
      text: "At this sign I should:",
      options: ["Stop and give way to traffic coming from my right.", "Slow down and proceed if there is no crossing traffic.", "Stop and proceed when the road is clear on both sides."],
      correctAnswer: 2,
      category: "Signs",
      difficulty: "medium",
      explanation: "Placeholder for stop sign logic.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign warns of:",
      options: ["A mountainous area ahead.", "A hump in the road ahead.", "Large waves in the river ahead."],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "easy",
      explanation: "The hump symbol indicates uneven road surfaces.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign regulates that:",
      options: ["Speed limit on this road is 60 km/h", "Speed limit on this road is between 60 km/h and 180 km/h", "Speed limit on this road is 80 km/h"],
      correctAnswer: 0,
      category: "Signs",
      difficulty: "easy",
      explanation: "Regulatory speed sign.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign is:",
      options: ["A danger warning sign", "A regulatory sign", "An informative sign"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "medium",
      explanation: "Circles are usually regulatory.",
      imageUrl: "sign_needed"
    },
    {
      text: "This sign is:",
      options: ["A carriageway marking.", "An informative sign", "A danger warning sign"],
      correctAnswer: 2,
      category: "Signs",
      difficulty: "medium",
      explanation: "Triangles are warning signs.",
      imageUrl: "sign_needed"
    },
    {
      text: "The warning sign of a broken down vehicle is:",
      options: ["The driver waving to the other road users.", "The flashing of indicators.", "The red reflective triangle."],
      correctAnswer: 2,
      category: "Emergency",
      difficulty: "easy",
      explanation: "The reflective triangle is the official warning device.",
    },
    {
      text: "On meeting an abnormal load vehicle under escort:",
      options: ["I should slow down and exercise caution", "I should sound my horn and flash my lights to alert him of my presence", "I should do nothing"],
      correctAnswer: 0,
      category: "Safety",
      difficulty: "medium",
      explanation: "Abnormal loads require extreme care and often take up the whole road.",
    },
    {
      text: "When riding a motorcycle you must wear:",
      options: ["A pair of cycle clips.", "A pair of sun glasses.", "A crash helmet"],
      correctAnswer: 2,
      category: "Legal",
      difficulty: "easy",
      explanation: "Helmets are mandatory for motorcycle riders.",
    },
    {
      text: "When turning left at a robot controlled intersection I should:",
      options: ["Yield to pedestrians to go through", "Give right of way to traffic from the right", "Sound the horn."],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Pedestrians in the crossing have priority.",
    },
    {
      text: "When an oncoming vehicle lights are on bright beam, what do you do?",
      options: ["Pull down the sun visor.", "Slow down and look slightly to the left.", "Switch spot lights on."],
      correctAnswer: 1,
      category: "Safety",
      difficulty: "medium",
      explanation: "Looking to the left edge helps you stay on track without being blinded.",
    },
    {
      text: "Which car stops?",
      options: ["Car C", "Car A", "Car B"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "Which car goes last?",
      options: ["Car B", "Car A", "Car C"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
      explanation: "Diagram question.",
      imageUrl: "diagram_needed"
    },
    {
      text: "In rural areas, where traffic is not controlled, you should give precedence to:",
      options: ["Traffic from the road on the right.", "To all crossing traffic.", "Traffic already in the intersection regardless of which side it is coming from."],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "hard",
      explanation: "Common law rule: priority to those already in the intersection.",
    },
    {
      text: "The minimum legal age at which an applicant can learn to drive is:",
      options: ["Eighteen years old.", "Any age.", "Sixteen years old."],
      correctAnswer: 2,
      category: "Legal",
      difficulty: "medium",
      explanation: "You can start learning at 16 in Zimbabwe.",
    },

    // --- Test 6 ---
    {
      text: "When in a straight ahead lane at an intersection I am allowed to:",
      options: ["Turn without indicating", "Go straight", "Change lanes without checking blind spots."],
      correctAnswer: 1,
      category: "Rules",
      difficulty: "easy",
    },
    {
      text: "At a four way junction which car goes first?",
      options: ["The car on the left", "The car on the right", "The first car to stop whether on the right or left"],
      correctAnswer: 2,
      category: "Intersections",
      difficulty: "hard",
      explanation: "Four-way stops usually follow the order of arrival.",
    },
    {
      text: "A speed derestriction sign means I may:",
      options: ["Do not exceed the stated speed", "Exceed previous speed limit", "Not exceed a speed of 130km/h"],
      correctAnswer: 1,
      category: "Signs",
      difficulty: "medium",
      imageUrl: "sign_needed"
    },
    {
      text: "When meeting a breakdown vehicle flashing its beacon lights I must:",
      options: ["Pull off the road completely", "Keep to the extreme left and pass as fast as possible.", "Proceed with caution"],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "medium",
    },
    {
      text: "When I intend to stop on the road I must:",
      options: ["Slow down check my rear view mirrors and stop.", "Slow down, check mirror, indicate intention, pull off the road and stop", "Flash my hazards and apply emergency brakes"],
      correctAnswer: 1,
      category: "Rules",
      difficulty: "medium",
    },
    {
      text: "How many passengers are permitted to be carried by a motor cycle with a side car attached?",
      options: ["Two", "One", "Three"],
      correctAnswer: 0,
      category: "Rules",
      difficulty: "medium",
    },
    {
      text: "A vehicle turning right should:",
      options: ["Give way to oncoming traffic proceeding straight", "Give way to pedestrians leaving the pavement", "Give way to cyclists going straight ahead"],
      correctAnswer: 0,
      category: "Intersections",
      difficulty: "medium",
    },
    {
      text: "A special medical certificate for public service vehicle drivers expires after:",
      options: ["Twelve months", "Eighteen months", "Five years"],
      correctAnswer: 0,
      category: "Legal",
      difficulty: "hard",
    },
    {
      text: "At the age of 17 years a person is allowed to drive:",
      options: ["Light motor vehicles only", "Minibuses and light cars", "Both heavy and light provided he/she is a holder of a class two driving licence"],
      correctAnswer: 0,
      category: "Legal",
      difficulty: "medium",
    },
    {
      text: "A 'one way' sign is:",
      options: ["A danger warning sign", "A parking sign", "An informative sign"],
      correctAnswer: 2,
      category: "Signs",
      imageUrl: "sign_needed"
    },
    {
      text: "Hazard perception means:",
      options: ["Reading a traffic situation well in advance", "Following police instructions as may be necessary", "Obeying danger signs only."],
      correctAnswer: 0,
      category: "Rules",
      difficulty: "medium",
    },
    {
      text: "How far from a corner am I prohibited from parking my vehicle?",
      options: ["7m", "17.5m", "7.5m"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
    },
    {
      text: "When may one proceed against a one way sign?",
      options: ["In any emergency", "Never", "When directed by police officer directing traffic"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "medium",
    },

    // --- Test 7 ---
    {
      text: "Which car goes last?",
      options: ["Car C", "Car B", "Car A"],
      correctAnswer: 0,
      category: "Intersections",
      imageUrl: "diagram_needed"
    },
    {
      text: "When approaching this sign I should:",
      options: ["Disengage gears.", "Engage high gear", "Engage a lower gear"],
      correctAnswer: 2,
      category: "Signs",
      imageUrl: "sign_needed"
    },
    {
      text: "You may legally block an intersection:",
      options: ["When you enter the intersection on the green light", "During rush hour traffic", "Under no circumstances"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "easy",
    },
    {
      text: "Which of the following vehicles is not subject to carrying a fire extinguisher?",
      options: ["A motor vehicle which is not yet registered", "A public service vehicle which is not carrying passengers", "A motor cycle"],
      correctAnswer: 2,
      category: "Legal",
      difficulty: "hard",
    },
    {
      text: "To drive a motor omnibus you must have reached the age of:",
      options: ["Eighteen years.", "Twenty years and medically fit", "Twenty-five years"],
      correctAnswer: 2,
      category: "Legal",
      difficulty: "hard",
    },
    {
      text: "How many classes of driver's licences do we have in Zimbabwe?",
      options: ["Five", "Four", "Six"],
      correctAnswer: 0,
      category: "Legal",
      difficulty: "hard",
    },
    {
      text: "When driving at 120km/h your total stopping distance is?",
      options: ["80 meters", "100 meters", "130 meters"],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "hard",
    },
    {
      text: "The reaction distance at 60km/h is?",
      options: ["12.4 meters", "5.6 meters", "8.3 meters"],
      correctAnswer: 0,
      category: "Safety",
      difficulty: "hard",
    },

    // --- Test 8 ---
    {
      text: "What do you do on hearing an ambulance approaching sounding special warning device?",
      options: ["Move as fast as possible", "Move out of its course and stop", "Move slowly on the left side"],
      correctAnswer: 1,
      category: "Safety",
      difficulty: "easy",
    },
    {
      text: "What time should persons driving on the road switch on their headlights?",
      options: ["Between 5:30pm and 6:30am", "Between 5:30am and 6:30pm", "Any convenient time"],
      correctAnswer: 0,
      category: "Legal",
      difficulty: "medium",
    },
    {
      text: "Your steering wheel must not have more than _____ of free play?",
      options: ["90 degrees", "30 degrees", "45 degrees"],
      correctAnswer: 2,
      category: "Safety",
      difficulty: "hard",
    },
    {
      text: "What is the maximum speed limit on wide tar roads?",
      options: ["There is no maximum speed limit", "100km/h", "120km/h"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "easy",
    },

    // --- Test 9 ---
    {
      text: "What is the general speed limit in an urban area?",
      options: ["40km/h", "80km/h", "60km/h"],
      correctAnswer: 2,
      category: "Rules",
      difficulty: "easy",
    },
    {
      text: "Who is required to wear a crash helmet?",
      options: ["Cyclists only", "Motor cyclists only", "Both of the above"],
      correctAnswer: 1,
      category: "Legal",
      difficulty: "easy",
    },
    {
      text: "When approaching a flooded bridge what do you do?",
      options: ["You can cross only when driving a heavy vehicle", "Do not attempt to cross", "Engage low gear and proceed slowly"],
      correctAnswer: 1,
      category: "Safety",
      difficulty: "easy",
    },

    // --- Test 10 ---
    {
      text: "Who is exempted from wearing a seat belt?",
      options: ["Learner driver", "Driving instructor", "Ambulance driver during the course of work"],
      correctAnswer: 1,
      category: "Legal",
      difficulty: "hard",
    },
    {
      text: "Whilst driving when do you take a mobile phone call?",
      options: ["Once you have stopped in a legally permitted place", "Whilst travelling in rural areas which do not have much traffic", "If you are confident that your ability will not be compromised by the distraction"],
      correctAnswer: 0,
      category: "Rules",
      difficulty: "easy",
    },
    {
      text: "The purpose of the parking brake is to:",
      options: ["Keep the vehicle stationary", "Keep the vehicle stationary on a gradient only", "Slow the vehicle down"],
      correctAnswer: 0,
      category: "Rules",
      difficulty: "easy",
    }
  ];

  try {
    console.log(`Adding ${newQuestions.length} questions...`);
    for (const q of newQuestions) {
      await db.insert(questionsTable).values({
        ...q,
        status: 'published',
        explanation: q.explanation || "No explanation provided for this question.",
        imageUrl: q.imageUrl === "diagram_needed" || q.imageUrl === "sign_needed" ? null : q.imageUrl
      });
    }

    console.log("✅ Successfully added all new questions!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add questions:", error);
    process.exit(1);
  }
}

addQuestions();
