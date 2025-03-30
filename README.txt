To whomever is reading this,

Hi!

My name is Denim Hasanbasic, and I've done a little assignment given to me by Zlatan. I was sadly unable to host the website as I stumbled upon some
issues with Vercel and MIME types, so I'm sending this as a local thing, and to make this easy to use, here's a detailed explanation and instructions:

CONTEXT:

I was tasked with creating a website alike Trip Advisor that has the purpose of showcasing restaurants in the town of Skovde (where I'm at). I understood
this requires a non-static website as we'd need the ability to have users and allow those users to leave reviews on the restaurants, and admins to
help moderate those users, or add new restaurants.

Due to the size of the town of Skovde, I went with the approach that Admins would add Restaurants themselves rather then utilizing any external program.
The idea being that if a new restaurant opened up in Skovde, I could call or e-mail the sites admin, provide information, and they'd display my restaurant.
I did not include any kind of payment protocols - the size of Skovde would make such a business model somewhat unprofitable if it was a simple one-time pay
to add your restaurant, and if a subscription based business model was used, I feel as if many users would simply not utilize the site due to other free
alternatives. So, I decided to keep with a simple non-profit and somewhat "fan" made schema.

The website provides users the ability to search dependent on name or type of cuisine the restaurant offers, see what the featured restaurant currently is,
and overall browse all existing restaurants on the site. In addition, they can leave a rating and review for restaurants and other users to see. Lastly,
a map service called Leaflet was provided which has the purpose of showcasing the location of the restaurant on a map.

Admins are provided the same benefits, with the addition of the usage of the Admin page which lets them to delete (ban) users, view profiles, and directly
edit their profiles if necessary. They also have the ability to add new restaurants into the database.

TECHNOLOGY:

Front-End - Vite
Back-End - Express.js 
Database - MongoDB

USAGE:

Since this is all local, some set-up is required. The Back-end is hosted on localhost:5000 and its started using npm run dev in the terminal (utilize on
global scale or in /server), the Front-end is on localhost:5173 and started using npm run dev in /client. For MongoDB, I've hard-set the usage via the MongoDB link inside the code, so it should recognize you as a user and take the information from there. If not, please contact me and I'll see about changing that up.

Additionally, I did set-up a single Admin user to get you started using my own personal username. In case you need to log-in, or want to log-out and make
your own account, here's the details for getting back into an Admin role:

Username: TheRealDemmy
Password: 123456

SHORTCOMINGS:

I tried to host the server using Render, Cloudinary, and Vercel, and I spent an ungodly amount of time getting it work, yet kept getting stuck on Vercel. I had to reset back many commits to get back to a working site. If it did work, the plan was for Render to build and maintain the back-end, Vercel for front-end, and Cloudinary for storage of images (profiles and restaurants).

END:

Lastly, thanks for taking the time reviewing this. I'm a fairly junior developer and if there are any other tools or best practices or ways of doing things, please inform me! I'd love to learn on how to do web dev related challenges a lot easier, and better.  