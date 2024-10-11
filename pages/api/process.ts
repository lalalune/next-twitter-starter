import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const twitterUsername = process.env.TWITTER_USERNAME!;
    const twitterPassword = process.env.TWITTER_PASSWORD!;
    const twitterEmail = process.env.TWITTER_EMAIL!;

    const twitterUserId = req.body.userId;

    const scraper = new Scraper();

    const cookiesFilePath = path.join(process.cwd(), "twitterCookies.json");

    if (fs.existsSync(cookiesFilePath)) {
      const cookiesData = fs.readFileSync(cookiesFilePath, "utf-8");
      const cookiesArray = JSON.parse(cookiesData);

      // Convert the array of cookie objects to an array of cookie strings
      const cookieStrings = cookiesArray.map(
        (cookie: { key: any; value: any; domain: any; path: any; secure: any; httpOnly: any; sameSite: any; }) =>
          `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${cookie.secure ? "Secure" : ""}; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${cookie.sameSite || "Lax"}`
      );

      await scraper.setCookies(cookieStrings);
    } else {
      await scraper.login(twitterUsername, twitterPassword, twitterEmail);
      const cookies = await scraper.getCookies();
      fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies), "utf-8");
    }

    // Fetch user's tweets and threads they've participated in
    const searchResponse = await scraper.fetchSearchTweets(
      `from:${twitterUserId} OR to:${twitterUserId}`,
      100, // Adjust the count as needed
      SearchMode.Latest
    );

    const processedTweets = searchResponse.tweets.map((tweet: Tweet) => ({
      id: tweet.id,
      name: tweet.name,
      username: tweet.username,
      text: tweet.text,
      inReplyToStatusId: tweet.inReplyToStatusId,
      createdAt: tweet.timeParsed,
      userId: tweet.userId,
      conversationId: tweet.conversationId,
      hashtags: tweet.hashtags,
      mentions: tweet.mentions,
      photos: tweet.photos,
      thread: [],
      urls: tweet.urls,
      videos: tweet.videos,
    }));

    res.status(200).json(processedTweets);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
}