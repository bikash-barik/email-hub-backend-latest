import dns from "dns";
import geoip from "geoip-lite";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import validator from "email-validator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFile = (req, res) => {
  upload.single("domainList")(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(400).send("File upload error");
    }

    let domainList;
    let domainListUploadPath;

    if (!req.file) {
      console.log("No files were uploaded");
      return res.status(400).send("No files were uploaded.");
    }

    domainList = req.file;
    domainListUploadPath = path.join(
      __dirname,
      "uploads",
      domainList.originalname + ".csv"
    );
    fs.writeFileSync(domainListUploadPath, domainList.buffer.toString());

    const domains = fs
      .readFileSync(domainListUploadPath, { encoding: "utf8" })
      .split("\n");
    domains.shift();
    domains.pop();
    res.json({ domains });
  });
};

const domainCountry= (req, res) => {
  upload.single('domainList')(req, res, function (err) {
      if (err) {
          console.error(err);
          return res.status(400).send("File upload error");
      }
  let domainList;
  let domainListUplaodPath;
  console.log("hI");

  if (!req.file) {
    console.log("No files were uploaded");
    return res.status(400).send("No files were uploaded.");
  }
  console.log("hI")
  
  domainList = req.file;
  domainListUplaodPath = path.join(__dirname, 'uploads', domainList.originalname);
  fs.writeFileSync(domainListUplaodPath, domainList.buffer.toString());

  const domains = fs
    .readFileSync(domainListUplaodPath, { encoding: "utf8" })
    .split("\n")
    .filter(
      (domain) =>
        ![
          "blog",
          "wordpress",
          "gov",
          "tumblr",
          "multiply",
          "tripod.com",
          "org",
          "ebay.com",
          ".ac",
          ".sh",
          "church",
          "typepad.com",
          "tripadvisor.com",
          ".hk",
          ".pk",
          "online",
          "imdb.com",
          "youtube.com",
          ".tv",
          "channel",
          "news",
          "press",
          "apply",
          "school",
          "college",
          "edu",
          "javadevjournal.com",
          ".in",
          "facebook.com",
          "twitter.com",
          "pintrest",
          "instragram",
          "yellowpages.com",
          "whitepages.com",
          "walmart.com",
          "expedia.com",
          "media",
          "groupon.com",
          "telegraph",
          "wayfair.com",
          "nih.",
          "apple.com",
          "reddit.com",
          "daily",
          "today",
          "cnet.com",
          "glassdoor.com",
          "target.com",
          "yelp.com",
          "indeed.com",
          "justdial.com",
          "ranker.com",
          "customercare",
          "domain",
          "noreply",
          "nobody",
          "webmd.com",
          "mapquest.com",
          "glossier.com",
          "fresh.com",
          "manta.com",
          "dailymail",
          "weather.com",
          "holiday",
          "weleda.com",
          "follain.com",
          "agutsygirl.com",
          "pcaskin.com",
          "kiehls.com",
          "cargurus.com",
          "foursquare.com",
          "animations.com",
          "design",
          "chron.com",
          "people.com",
          ".tech",
          ".info",
          "pcmag.com",
          "google",
        ].includes(domain.trim().toLowerCase())
    );
  domains.shift();
  domains.pop();

  const results = [];

  const lookupPromise = (domain) => {
    return new Promise((resolve, reject) => {
      dns.lookup(domain, (err, address) => {
        if (err) {
          reject(err);
        } else {
          const country = geoip.lookup(address)?.country;
          if (country) {
            resolve({ domain, country });
          } else {
            reject(`Error getting country name for domain ${domain}`);
          }
        }
      });
    });
  };

  Promise.all(domains.map((domain) => lookupPromise(domain.trim())))
    .then((results) => {
      res.json(results);
      // console.log(results);
    })
    .catch((err) => {
      console.error(`Error verifying DNS: ${err}`);
      res.status(500).send("Internal server error");
    });
  
  });
}

const AutodomainCountry = (req, res) => {
  const { domains } = req.body;
  console.log("domains",domains);

  if (!domains || !Array.isArray(domains)) {
    return res.status(400).send("Invalid input. Expected an array of domains.");
  }

  const results = [];

  const lookupPromise = (domain) => {
    return new Promise((resolve, reject) => {
      dns.lookup(domain, (err, address) => {
        if (err) {
          reject(err);
        } else {
          const country = geoip.lookup(address)?.country;
          if (country) {
            resolve({ domain, country });
          } else {
            reject(`Error getting country name for domain ${domain}`);
          }
        }
      });
    });
  };

  Promise.all(domains.map((domain) => lookupPromise(domain.trim())))
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.error(`Error verifying DNS: ${err}`);
      res.status(500).send("Internal server error");
    });
};

const extractEmail = async (req, res) => {
  upload.single("domainList")(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(400).send("File upload error");
    }

    let domainList;
    let domainListUploadPath;

    if (!req.file) {
      console.log("No files were uploaded");
      return res.status(400).send("No files were uploaded.");
    }

    domainList = req.file;
    domainListUploadPath = path.join(__dirname, "uploads", domainList.originalname + ".csv");
    fs.writeFileSync(domainListUploadPath, domainList.buffer.toString());

    const domains = fs.readFileSync(domainListUploadPath, { encoding: "utf8" }).split("\n");
    domains.shift();
    domains.pop();
    console.log(domains);

    const emailAddresses = {};

    const browser = await puppeteer.launch({ headless: "new" }); // Pass headless: "new"

    try {
      await Promise.all(domains.map(async (domain) => {
        const url = `https://${domain.trim()}`;

        try {
          const page = await browser.newPage();
          await page.goto(url, { timeout: 60000 });
          const matches = await page.$$eval("a[href]", (links) => {
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            return links
              .map((link) => link.href.match(emailRegex))
              .filter((matches) => matches !== null)
              .flat()
              .filter((match, index, self) => self.indexOf(match) === index);
          });
          if (matches && matches.length > 0) {
            emailAddresses[url] = matches;
          }
          await page.close();
        } catch (error) {
          console.error(`Error for ${url}: ${error.message}`);
        }
      }));

      if (Object.keys(emailAddresses).length > 0) {
        res.send(emailAddresses);
        console.log(emailAddresses);
      } else {
        res.send("No email addresses found in the uploaded file.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      await browser.close();
    }
  });
};


const validateEmail = (req, res) => {
  upload.single("emailList")(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(400).send("File upload error");
    }

    let emailList;
    let emailListUplaodPath;

    if (!req.file) {
      console.log("No files were uploaded");
      return res.status(400).send("No files were uploaded.");
    }

    emailList = req.file;
    emailListUplaodPath = path.join(
      __dirname,
      "uploads",
      emailList.originalname
    );
    fs.writeFileSync(emailListUplaodPath, emailList.buffer.toString());

    const emails = fs
      .readFileSync(emailListUplaodPath, { encoding: "utf8" })
      .split("\n");
    emails.shift();
    emails.pop();

    const blacklist = [
      "domain",
      "Job",
      "feedback",
      "google",
      "helpdesk",
      "donate",
      "booking",
      "subscribe",
      "postmaster",
      "ticket",
      "police",
      "enquiries",
      "privacy",
      "example",
      "name",
      "email",
      ".png",
      ".jpeg",
      ".jpg",
      ".gif",
      "reception",
      "communication",
      "community",
      "register",
      ".life",
      "firstname",
      "lastname",
      "customer.",
      "customercare",
      "wecare",
      "customerservice",
      "CustomerAssistance",
      "NDW@MSN.com",
      "editor",
      "frontdesk",
      "massage@gmail.com",
      ".expert",
      "hi@",
      ".mx",
      "police",
      "mail@",
      "questions",
      "exam",
      "information",
      "webcam",
      "license",
      ".io",
      "Wixpress",
      "police",
      ".site",
      ".to",
      ".make",
      ".xyz",
      ".gcb",
      "hello",
      ".studio",
      "registra",
      "sentry",
      "reservation",
      "%",
      "e-mail",
      "financial",
      "bank",
      "credit",
      "card",
      "auto",
      "www.",
      "answer",
      ".info",
      "enquiry",
      "press",
      "student",
      "news",
      "camera",
      "secretariat",
      "contribute",
      "donate",
      "boxoffice",
      ".js",
      "president",
      "inquiries",
      "member",
      "gov",
      "help",
      ".css",
      "webmaster",
      "sample",
      "test",
      "john@doe.com",
      "x@y.com",
      ".svg",
      "customerservices",
      "recruit",
    ];

    const validEmails = [];
    const invalidEmails = [];

    for (let email of emails) {
      email = email.trim(); // remove whitespace
      if (validator.validate(email) && !blacklist.includes(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    }

    res.json({ validEmails, invalidEmails });
  });
};

export { uploadFile, domainCountry, extractEmail, validateEmail,AutodomainCountry };
