'use client';

import { TwitterAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback, useMemo, useState } from "react";
import { getFirebaseAuth } from "./firebase";

type Credentials = {
  accessToken: string;
  secret: string;
  userId: string;
};

const STORAGE_KEY = "twitter:credentials";

const credentialCache: Record<string, Credentials> = {};

export default function App() {
  const [data, setData] = useState<Record<string, { name: string; text: string }>>();

  const getCredentials = useMemo(() => {
    return (): Credentials | undefined => {
      const storedCredentials = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : JSON.stringify(credentialCache);
      return storedCredentials ? JSON.parse(storedCredentials) : undefined;
    };
  }, []);

  const [credentials, setCredentialsData] = useState<Credentials | undefined>(getCredentials());

  const setCredentials = useMemo(() => {
    return (credentials: Credentials | undefined): void => {
      if (credentials) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
        } else {
          credentialCache[credentials.userId] = credentials;
        }
        setCredentialsData(credentials);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setCredentialsData(undefined);
      }
    };
  }, []);

  const connectTwitter = useMemo(() => {
    return async () => {
      const auth = getFirebaseAuth();

      const provider = new TwitterAuthProvider();
      const res = await signInWithPopup(auth, provider);
      console.log(res);
      const credential = TwitterAuthProvider.credentialFromResult(res);
      console.log(credential);
      if (!credential?.accessToken || !credential?.secret) {
        console.log(credential);
        throw new Error("Invalid Twitter credentials.");
      }

      console.log("credential", credential);

      const result = {
        accessToken: credential.accessToken,
        secret: credential.secret,
        userId: (res.user as any).reloadUserInfo.screenName, // Extract the screen name
      };

      setCredentials(result);

      return result;
    };
  }, []);

  const useConnectTwitter = useMemo(() => {
    return () => {
      const [inFlight, setInFlight] = useState(false);

      const callback = useCallback(() => {
        setInFlight(true);
        connectTwitter()
          .then((credentials) => {
            setCredentials(credentials);
          })
          .finally(() => {
            setInFlight(false);
          });
      }, [setCredentials]);

      return [callback, inFlight] as const;
    };
  }, []);

  const [connect, inFlight] = useConnectTwitter();

  const disconnect = useCallback(() => {
    setCredentials(undefined);
  }, [setCredentials]);

  const fetchData = useCallback(async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    console.log(credentials);

    // Post the tweet to the API.
    const res = await fetch("/api/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: credentials!.accessToken,
        secret: credentials!.secret,
        userId: credentials!.userId,
      }),
    });

    // TODO: Handle errors
    if (!res.ok) {
      throw new Error("Failed to post process.");
    }

    const data = await res.json();
    console.log(data);
    setData(data);
    return data;
  }, [credentials]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-sm w-full px-4">
        {credentials && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={fetchData}
          >
            Fetch Data
          </button>
        )}
        {!credentials && (
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${inFlight ? "opacity-50 cursor-not-allowed" : ""
              }`}
            onClick={credentials ? disconnect : connect}
            disabled={inFlight}
          >
            {credentials ? "Disconnect Twitter" : "Connect Twitter"}
          </button>
        )}
        {data && (
          <div className="mt-4 w-full h-48 overflow-y-auto">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                {value.name} - {value.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}