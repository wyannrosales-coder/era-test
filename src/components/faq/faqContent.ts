/** One FAQ topic and its questions (Figma 1227:11041); answers are HTML. */
export type FaqTopic = { id: string; label: string; questions: { question: string; answer: string }[] };

/** The live site's FAQs (epiisod.com/en-au/faqs), under the design's topic names. */
export const FAQ_TOPICS: FaqTopic[] = [
  {
    id: "general",
    label: "General",
    questions: [
      {
        question: "How do I check for room availability?",
        answer: "<p>You may check for room availability on our website:</p><ol><li>Select your desired room type</li><li>Under the ‘Find Your Room’ section of the room page, you can look through the room availability</li></ol>",
      },
      {
        question: "Is the student population diverse?",
        answer: "<p>Absolutely. At EPIISOD, we are committed to fostering a welcoming, inclusive, and respectful environment. We actively embrace diversity and promote a culture of equality and fairness. Our team is trained to ensure all students and visitors are treated with dignity and respect.</p><p>Our goal is to create a home where everyone feels safe, supported, and free from discrimination, harassment, or bullying.</p>",
      },
      {
        question: "Who can stay at EPIISOD?",
        answer: "<p>Our accommodation is available to students enrolled at a recognised educational institution. To complete your booking, you will need to provide a Confirmation of Enrolment (CoE) or an official Acceptance Letter. International students must also supply a copy of their student visa.</p><ul><li>International Students: Only those who have turned 18 on or before the tenancy start date are eligible.</li><li>Domestic Students: Students must turn 18 within the calendar month in which the tenancy commences. Unfortunately, we are unable to accommodate students who turn 18 later in the year.</li></ul>",
      },
      {
        question: "I am under 18, can I live at EPIISOD?",
        answer: "<p>Students must be 18 years old or turning 18 within two weeks of their check-in date, to be eligible to live at Epiisod.</p>",
      },
      {
        question: "How safe is our accommodation?",
        answer: "<p>The safety and well-being of our residents is our top priority. All entrances to our properties are monitored by 24/7 CCTV, and each apartment is secured with a controlled access system.</p><p>Additionally, residential assistants are available onsite, even outside regular office hours, to provide support whenever needed. We also conduct regular fire alarm testing and adhere to strict fire safety protocols across all EPIISOD properties.</p>",
      },
      {
        question: "Can a formaldehyde test report be provided? Will the building have an official occupancy certificate?",
        answer: "<p>Once the building has achieved an Occupancy Certificate (OC), it is deemed fit for occupation and compliant with the Australian Building Code. This process requires certification and approval by the relevant council and government authorities.</p><p>Following OC, Practical Completion (PC) is achieved and the building is formally handed over for operation.</p>",
      },
      {
        question: "Is there any obstruction to the view from the apartment?",
        answer: "<p>The property is in a leafy area and is surrounded by nearby buildings. For more open views, we recommend selecting City View or Pool View rooms, which are generally located on higher floors.</p>",
      },
    ],
  },
  {
    id: "booking",
    label: "Booking and payment",
    questions: [
      {
        question: "What documents are required to book a room?",
        answer: "<p>To complete your booking, please provide the following documents based on your residency status:</p><p><strong>For International Students:</strong></p><ul><li>A copy of your Student Visa (or confirmation that it is currently in process).</li><li>Your Confirmation of Enrolment (COE) from your university or college.</li><li>A valid passport copy.</li></ul><p><strong>For Australian Citizens or Permanent Residents:</strong></p><ul><li>A valid passport or driver’s license.</li><li>An official enrolment letter from your university or college.</li><li>Your student ID card.</li></ul><p><em>If you need further assistance or clarification, our team is ready to help!</em></p>",
      },
      {
        question: "How do I book a room?",
        answer: "<p>Step 1: Select your preferred room type and tenancy duration on our website</p><p>Step 2: Create an account with EPIISOD</p><p>Step 3: Complete your application and pay the holding deposit</p><p>Step 4: Acknowledge and sign-off on your tenancy agreement</p><p>At this stage, your room will be reserved.</p>",
      },
      {
        question: "What payments do I need to make when applying?",
        answer: "<p>When you book, you are required to pay a 1-week deposit to reserve your room which will go towards your first rental payment. Additionally, a bond (equivalent to 4 weeks’ rent) must be paid within 1 week of your deposit. This bond will be lodged with NSW Fair Trading and held as a security deposit for the duration of your stay.</p><p>At the end of your tenancy, the bond will be refunded—provided there are no outstanding rent payments, damages to the room, or cleaning charges.</p>",
      },
      {
        question: "When do I pay my rent?",
        answer: "<p>Subsequent rent will be charged every 2 weeks on the rental payment dates. For further assistance regarding rent payment, please contact our friendly staff:</p><p>✉ <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a><br>☎ <a href=\"tel:+61 (0) 417 977 706\">+61 (0) 417 977 706</a></p><p>Weekdays 9am to 5pm Sydney Time (Exclude Public Holiday)</p>",
      },
      {
        question: "Is my reservation confirmed once I pay the holding deposit?",
        answer: "<p>Your reservation is only confirmed once you have received and signed your tenancy agreement.</p>",
      },
      {
        question: "Can I view the accommodation before applying?",
        answer: "<p>As the property is not yet ready, we are unable to provide tours of the actual building. However, you are welcome to visit our show flat, where we can walk you through the layout, furnishings, and facilities to give you a clear idea of what to expect.</p><p>To schedule a showflat tour, please contact our team:</p><p>✉ <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a><br>☎ <a href=\"tel:+61 (0) 417 977 706\">+61 (0) 417 977 706</a></p><p>Weekdays 9am to 5pm Sydney Time (Exclude Public Holiday)</p>",
      },
      {
        question: "What is included in my rent?",
        answer: "<p>Your rent is all-inclusive, covering utility bills and high-speed Wi-Fi—so you’ll never need to worry about unexpected charges or paying bills on time.</p><p>This includes most of our exclusive Resi-Life Programme, offering a curated calendar of resident-only events and activities throughout the year. Many events are complimentary, though select experiences may incur an additional ticket fee.</p><p>The only additional cost is for the use of laundry machines, which are pay-per-use.</p>",
      },
      {
        question: "Will I be able to select my own desired room?",
        answer: "<p>Yes. You can select your desired room type, room facing and room level.</p>",
      },
      {
        question: "Can I live with my friends or specify preferences for my roommates?",
        answer: "<p>Yes! If you wish to live with friends in our shared apartments, please mention their names in your application and ensure they do the same in theirs. While we strive to accommodate roommate preferences, this is subject to availability and cannot be guaranteed.</p>",
      },
      {
        question: "Can I have additional occupant staying with me throughout my lease?",
        answer: "<p>At EPIISOD Macquarie Park, we allow another occupant to stay with you for an additional $60 per week, depending on your selected room:</p><ul><li>Empowered Studio</li><li>Premier Empowered Studio</li></ul><p>For more information, please contact our team at EPIISOD Macquarie Park:</p><p>✉ <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a><br>☎ <a href=\"tel:+61 (0) 417 977 706\">+61 (0) 417 977 706</a></p><p>Weekdays 9am to 5pm Sydney Time (Exclude Public Holiday)</p>",
      },
      {
        question: "If I fail to make payment for an extended period, will my contract be automatically terminated?",
        answer: "<p>No, contracts are not automatically terminated. I will be signing a Residential Tenancy Agreement that is lodged with the NSW Civil &amp; Administrative Tribunal (NCAT). Any non-payment issues are managed through a clearly defined legal process, which may involve penalties.</p>",
      },
      {
        question: "What if I choose to stay at EPIISOD longer than my contract length?",
        answer: "<p>Yes, you can stay at EPIISOD for the duration of your studies. We will contact you prior to the end of your lease to see if you would like to renew your contract with us.</p>",
      },
    ],
  },
  {
    id: "moving-in",
    label: "Moving in",
    questions: [
      {
        question: "When can I move in?",
        answer: "<p>You may move into your room from the start date stated on your tenancy agreement, provided that you have paid the correct rent amount and submitted all required documents.</p><p>If you wish to move in earlier, please contact our on-site team at <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a>. If an earlier move-in be possible, your tenancy dates will be adjusted accordingly, and additional fees will apply to cover the extended stay.</p><p>For more information, please contact our team at EPIISOD Macquarie Park:<br>✉ <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a><br>☎ +61 (0) 417 977 706<br>Weekdays 9am to 5pm Sydney Time (Exclude Public Holiday)</p>",
      },
      {
        question: "Are there any documents I need to bring with me?",
        answer: "<p>Before your arrival, you will be required to provide: </p><ul><li>Confirmation of Enrolment (CoE) or Acceptance Letter from your institution</li><li>A copy of your passport or other official photo ID</li><li>For international students, a copy of your valid visa</li></ul>",
      },
      {
        question: "Can I bring family and friends with me when I move in?",
        answer: "<p>Yes! Family &amp; friends are welcome to help you move into your new home; however, we ask you to be mindful of other students.</p>",
      },
      {
        question: "What if I’m arriving out of office hours?",
        answer: "<p>Before your arrival, you will be receiving an email to select your arrival date and time. If you expect to arrive outside of regular office hours, please contact the on-site team at <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a> in advance. Our staff will arrange an alternative check-in process for you.</p><p>For more information, please contact our team at EPIISOD Macquarie Park:</p><p>✉ <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a><br>☎ +61 (0) 417 977 706</p><p>Weekdays 9am to 5pm Sydney Time (Exclude Public Holiday)</p>",
      },
      {
        question: "Can I store my luggage before my lease starts?",
        answer: "<p>No, complimentary luggage storage is not available prior to lease commencement.<br><br>Check out services like <a href=\"https://www.taxibox.com.au/?srsltid=AfmBOoqEdEsibGIheYJiiuRnmBgQeLDlzL8Zc-ereygplxi_5p1pqqgq\" target=\"_blank\" rel=\"noopener noreferrer\"><u>TAXIBOX</u></a>. They are a convenient mobile storage solution—they deliver a storage unit to the site for you to load, then take it away to store securely. Prices start from around $199 per month.</p>",
      },
      {
        question: "Will I receive a checklist to inspect my apartment at check-in?",
        answer: "<p>Yes. You will be required to complete a Condition Report within 24 hours of arrival as part of the Residential Tenancy Agreement. This must be returned to the EPIISOD Macquarie Park team.</p>",
      },
      {
        question: "What kind of electrical equipment can I use?",
        answer: "<p>For safety, please observe the following guidelines:</p><ul><li><p>Only use electrical appliances purchased in Australia</p></li><li><p>Do not overload power sockets</p></li><li><p>Never leave electrical items plugged in unattended</p></li><li><p>Kitchen appliances must not be used in bedrooms</p></li></ul><p>You are responsible for ensuring all appliances you bring are safe, free from defects, and in good working condition. Appliances that are broken, have frayed/exposed wires, show signs of overheating, or have loose connections are prohibited. Unsafe items identified during inspections will be removed for your safety.</p>",
      },
      {
        question: "Can I bring my own refrigerator? Does the refrigerator include a freezer?",
        answer: "<p>Each studio includes a refrigerator. Shared apartments have a shared refrigerator in the common kitchen. Personal refrigerators or large appliances are not permitted unless prior approval is obtained from management.</p><p>There is no standalone freezer. However, studio refrigerators include a small freezer or cold box compartment.</p>",
      },
      {
        question: "If I do not select the rice cooker or toaster during the booking phase, may I know which appliance I will receive?",
        answer: "<p>If I book a studio without selecting a rice cooker or toaster, a toaster will be provided by default.</p>",
      },
      {
        question: "Can I keep pets at EPIISOD?",
        answer: "<p>Pets are generally not permitted at EPIISOD. An exception is made for recognised assistance animals (e.g. a seeing or hearing guide dog). In all cases, residents must seek written approval from EPIISOD before bringing any animal onto the premises.</p>",
      },
      {
        question: "Is the shower fixed or handheld?",
        answer: "<p>The shower is fixed.</p>",
      },
      {
        question: "What do I need to bring?",
        answer: "<p>Our rooms come fully furnished, including a mattress and mattress protector. You will need to bring your own towels, blankets, sheets, and pillow.</p><p>Bed sizes are as follows:</p><ul><li>Studio apartments: Double bed</li><li>Quad/Quint rooms: King single bed</li></ul><p>Residents are required to supply their own kitchen items, including plates, cups, cookware, cutlery, and any additional cooking utensils. A toaster or rice cooker will be provided. You will also need to bring personal items such as coat hangers, cleaning products, laundry detergent, toiletries, and your own clothing and belongings.</p>",
      },
    ],
  },
  {
    id: "living",
    label: "Living at EPIISOD",
    questions: [
      {
        question: "How do I stay connected with others?",
        answer: "<p>Staying connected starts with staying social! We offer multiple ways to keep you in the loop and help you meet new people. Follow our social media channels to stay updated on everything happening at your site:</p><p><a href=\"https://linktr.ee/epiisod.au\" target=\"_blank\" rel=\"noopener noreferrer\"><u>EPIISOD Australia</u></a></p><p>We also encourage you to join our weekly resi-life events. These activities are designed exclusively for our residents and run throughout the year—offering you the perfect opportunity to have fun, relax, and make lifelong friends.</p>",
      },
      {
        question: "Will there be any events happening at my site?",
        answer: "<p>Absolutely! At EPIISOD, we believe in creating a vibrant community where residents can connect, collaborate, and create lasting memories. Our resi-life team is dedicated to planning a variety of exciting events throughout the year—ranging from social gatherings to themed activities and workshops.</p><p>Stay tuned by checking our social media pages and noticeboards around the property. Got an idea for an event? We’d love to hear it! Share your suggestions with the team at <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a>.</p>",
      },
      {
        question: "How do I receive parcels and post at my site?",
        answer: "<p>We make parcel collection simple and secure. Here’s how it works:</p><ul><li>Our reception team will sign for your parcels and letters during business hours.</li><li>In the afternoon, we’ll process them and send you a notification via email and/or mobile app.</li><li>Bring a valid photo ID to collect your items from reception.</li><li>Some items may be placed in the parcel locker for your convenience. You will receive instructions on the EPIISOD app for retrieval if this applies to your delivery.</li></ul><p>To ensure smooth delivery, please provide your full name and room number when ordering online. Parcels without complete details will not be accepted.</p>",
      },
      {
        question: "What if I want to move rooms?",
        answer: "<p>We work hard to place every resident in a room that best suits their needs. However, we understand that sometimes a change may be necessary.</p><p>If you wish to move after check-in, please speak to our reception team first—they may be able to resolve any concerns without the need for a move. If a transfer is still the best option, we’ll guide you through the process. </p><p>For more information, please contact our team at EPIISOD Macquarie Park:</p><p>✉ <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a><br>☎ +61 (0) 417 977 706</p><p>Weekdays 9am to 5pm Sydney Time (Exclude Public Holiday)</p>",
      },
      {
        question: "What happens if something in my apartment breaks or doesn’t work?",
        answer: "<p>Our dedicated maintenance team is readily available to assist you.</p><p>Simply log your maintenance issue through the EPIISOD app and our facilities assistant will promptly address the issue to ensure your stay remains hassle-free.</p>",
      },
      {
        question: "Where can I smoke?",
        answer: "<p>Smoking is not permitted inside the residence or in shared indoor spaces.</p>",
      },
      {
        question: "Does the air conditioning maintain a constant temperature? Is there underfloor heating?",
        answer: "<p>There is no underfloor heating. You will be able to control the temperature within the room using the in-room air-conditioning system.</p>",
      },
      {
        question: "What does the smart lock system use?",
        answer: "<p>You can use the EPIISOD Living app, which can be downloaded from the app store, to access your room.</p>",
      },
      {
        question: "Do I need to inform management if I am away for an extended period?",
        answer: "<p>Yes. If you will be away for any period of time, you must inform the team. Under the House Rules, notification is required for absences longer than 3 days.</p>",
      },
      {
        question: "If I have any queries about my stay, who can I speak to?",
        answer: "<p>Our friendly site team is always ready to help. You can drop by the reception for a face-to-face chat or email us at <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a> for assistance at any time.</p>",
      },
      {
        question: "How do I download and set up my resident apps?",
        answer: "<p>You will need to download two separate apps to enjoy the full EPIISOD experience. </p><p>Please follow the instructions below for each:</p><p><strong>App 1: EPIISOD Living (Your Resident Hub)</strong></p><p>Use this app to stay informed, log maintenance requests, track parcels, view amenities, manage billing and much more!</p><ol><li><p>Download <strong>EPIISOD Living app</strong></p><p><a href=\"https://play.google.com/store/apps/details?id=com.epiisod.mobile\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://media.epiisod.com/s3fs-public/inline-images/google-play.png\" alt=\"Get it on Google Play\" class=\"faq-store-badge\" loading=\"lazy\"></a></p><p><a href=\"https://apps.apple.com/us/app/epiisod-living/id6757422745\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://media.epiisod.com/s3fs-public/inline-images/app-store.png\" alt=\"Download on the App Store\" class=\"faq-store-badge\" loading=\"lazy\"></a></p></li><li>Log In: Simply log in using the same email address you used to make your booking.<br> </li></ol><p><strong>App 2: EPIISOD Access (Your Digital Key)</strong></p><p>Use this app to access the building, unlock your room, and control in-room smart devices like lighting, air-conditioning and smart power plug. Please complete these steps before arrival:</p><ol><li><strong>Trigger creation of EPIISOD Access App login: </strong>Check Email to trigger your EPIISOD Access app login details<br><br>a. Look for email titled: <span><strong>Get Ready for Arrival: Activate Your EPIISOD Access Account</strong></span><br>b. Click on '<strong>Activate My EPIISOD Access App Account</strong>' link in the email:<br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20App%20-%201st%20email%20-%20Get%20Ready%20for%20Arrival%20-%20Activate%20Your%20EPIISOD%20Access%20Account.jpg\" alt=\"\" loading=\"lazy\"><br><br>c. You will be redirected to the website to log in. <br>Once logged in, navigate to the '<a href=\"https://epiisod.com/en-au/profile\" target=\"_blank\" rel=\"noopener noreferrer\"><strong><u>My Account</u></strong></a>' page and select the '<strong>Click Here</strong>' button under '<strong>Your key to smart living</strong>' to generate your login details. <br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20Access%20app%20login%20trigger.jpg\" alt=\"\" loading=\"lazy\"><br> </li><li><p>Download <strong>EPIISOD Access App</strong></p><p><a href=\"https://apps.apple.com/us/app/epiisod-access/id6743195318\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://media.epiisod.com/s3fs-public/inline-images/google-play.png\" alt=\"Get it on Google Play\" class=\"faq-store-badge\" loading=\"lazy\"></a></p><p><a href=\"https://play.google.com/store/apps/details?id=com.dwell.apartment\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://media.epiisod.com/s3fs-public/inline-images/app-store.png\" alt=\"Download on the App Store\" class=\"faq-store-badge\" loading=\"lazy\"></a><br><br> </p></li><li>Receive <strong>EPIISOD Access App Login</strong> details:<ol><li>Look for email titled: <strong>Your EPIISOD Access Account Details</strong></li><li><p><strong>Login to the EPIISOD Access App</strong> using the login details in the email<br><strong><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20App%20-%202nd%20email%20-%20Your%20EPIISOD%20Access%20Account%20Details.jpg\" alt=\"\" loading=\"lazy\"></strong><br><br>You can now <strong>unlock your room door </strong>with <strong>EPIISOD Access App</strong>:<br><br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20-%201%20Unlock%20room%20door%20with%20app%20Img.JPG\" alt=\"\" loading=\"lazy\"><br> </p></li></ol></li><li>Add <strong>Digital Access Code </strong>onto your EPIISOD Access App to unlock main entrance, lifts &amp; communal spaces<strong>:</strong><ol><li>Look for email titled: <strong>Your EPIISOD Digital Access Code</strong><br><strong><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20App%20-%20Your%20EPIISOD%20Access%20Access%20Code.jpg\" alt=\"\" loading=\"lazy\"></strong><br> </li><li>Add your<strong> Digital Access Card Code</strong> onto your <strong>EPIISOD Access App</strong>:</li><li>Log in to the <strong>EPIISOD Access app</strong></li><li>Tap your <strong>profile picture</strong> (top-left)</li><li>Select “<strong>Access Card</strong>”</li><li><p>Enter the <strong>Digital Access Card Code</strong> from your email to activate your digital key.<br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/1.png\" alt=\"\" loading=\"lazy\"><br><br>You can now unlock main entrance, lifts and communal areas with your Digital Access Card on your EPIISOD Access App!<br><br><br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20-%202%20HID%20door%20unlocked%20Img.JPG\" alt=\"\" loading=\"lazy\"><br> </p></li></ol></li><li>Unlock your room door via PIN<br>Your room door also has a keypad. It's an alternative way of entering your room when you do not have your phone with you. The PIN is different from your app login and can be found in an email titled “<strong>Smart Residence Access Password</strong>”.<br><ol><li>Look for email titled: \"<strong>Smart Residence Access Password</strong>”.<br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20-%20Smart%20door%20pin.jpg\" alt=\"\" loading=\"lazy\"><br> </li><li>To use the PIN, simply tap onto the digital door lock</li><li><p>Once the keypad lights up, enter your PIN followed by the # key to unlock the door.<br><br><img src=\"https://media.epiisod.com/s3fs-public/inline-images/EPIISOD%20-%20Unlock%20room%20with%20PIN%20Img_2.JPG\" alt=\"\" loading=\"lazy\"><br> </p></li></ol></li></ol>",
      },
    ],
  },
  {
    id: "moving-out",
    label: "Moving out",
    questions: [
      {
        question: "When does my contract start or end in 2026/2027?",
        answer: "<ul><li>Semester 1: Contracts may commence anytime between 7th February 2026 and 20th February 2026. The contract end date will be on or before 14th July 2026 or 16th February 2027, depending on your chosen lease duration.</li><li>Semester 2: Start dates are yet to be confirmed. Stay updated on Semester 2 bookings and announcements by subscribing to our newsletter. The contract will conclude on or before 16th February 2027 or 14th July 2027, based on your lease term.</li></ul><p>Please note: You may move in any time after your contract begins; however, rental payments are calculated from the contract start date. Do reach out to <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a> for more details.</p>",
      },
      {
        question: "I want to leave before my contract ends. What can I do?",
        answer: "<p>If you wish to vacate your accommodation prior to the contract end date, please review our <a href=\"https://epiisod.com/en-au/cancellation-policy\" target=\"_blank\" rel=\"noopener noreferrer\"><u>cancellation policy</u></a> carefully. It provides clear instructions on the necessary steps and any applicable fees.</p>",
      },
      {
        question: "How do I get my bond back?",
        answer: "<p>At EPIISOD Macquarie Park, bond returns are initiated within 10 business days after you vacate the property. You will receive an email with a link to review the bond claim details. Confirm or dispute charges and provide your bank details for the refund. Once all parties agree, the Residential Bonds Office (RBO) will process the payment within a few business days.</p><p><br><em>Please note: Any damages beyond normal wear and tear may affect your bond refund.</em></p>",
      },
      {
        question: "Do I have to pay for the damages?",
        answer: "<p>We strive to provide a comfortable living experience. Our on-site maintenance team promptly addresses all repair requests.</p><p>Charges will only apply for damages caused by misuse or neglect. Normal wear and tear are not chargeable. Residents are responsible for their guests’ conduct; any damages caused by guests will be charged to the hosting resident. If damage occurs in shared spaces and responsibility cannot be determined, costs will be split evenly among apartment residents.</p><p>All charges will be invoiced and payable within 30 days. For further inquiries, please contact our management team at <a href=\"mailto:empsydney@epiisod.com\">empsydney@epiisod.com</a>.</p>",
      },
    ],
  },
  {
    id: "facilities",
    label: "Facilities and services",
    questions: [
      {
        question: "Where can I do my laundry?",
        answer: "<p>EPIISOD Macquarie Park has convenient on-site laundry facilities for residents. Usage charges apply.</p>",
      },
      {
        question: "Is Wi-Fi included in my accommodation?",
        answer: "<p>High-speed Wi-Fi is included throughout both properties, ensuring you stay connected for work, study, or leisure without interruption.</p><p>Upon arrival, you will need to onboard your device and connect your setup on the network. You will use the same email address that was used to book your room with EPIISOD.</p><p>If you have any issues with your Wi-Fi, kindly contact Superloop directly:</p><p>✉ <a href=\"mailto:smart.help@superloop.com\">smart.help@superloop.com</a><br>☎ 1300 262 047</p>",
      },
      {
        question: "Is there bike storage?",
        answer: "<p>Yes. EPIISOD Macquarie Park provides secure bicycle parking on the Lower Ground floor.</p>",
      },
      {
        question: "Is parking available at EPIISOD Macquarie Park?",
        answer: "<p>Yes. Parking is charged in monthly instalments and is offered on a first-come, first- served basis. Parking is guaranteed only for the period paid. All parking is located within the building at basement levels (Lower Ground and Upper Ground).</p>",
      },
      {
        question: "Are the pool, gym, and yoga studio open 24 hours? Is the pool heated?",
        answer: "<p>The swimming pool is heated and operates daily from 7:00am to 9:00pm. The gym and yoga studio are available 24 hours. The ice plunge and sauna are located on Level 10 Sky Wellness Sanctuary.</p>",
      },
      {
        question: "Are there any discounts at the café?",
        answer: "<p>Yes, the café is exclusive only to the residents of EPIISOD Macquarie Park and discounts are available. Please visit the café for more information.</p>",
      },
    ],
  },
  {
    id: "house-rules",
    label: "House rules",
    questions: [
      {
        question: "Where can I read the house rules?",
        answer: "<p><a href=\"https://media.epiisod.com/s3fs-public/2026-07/EPIISOD%20house%20rules%20V3%20(010726).pdf\" target=\"_blank\" rel=\"noopener noreferrer\">Click to view our house rules</a>.</p>",
      },
    ],
  },
];
