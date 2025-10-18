// we need to initialize the database Neon from here using the environent variables

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/singlestore";
import * as schema from "./schema";

const sql=neon(process.env.DATABASE_URL!)

// create and export the Drizzle orm instance 
export const db= drizzle(sql,{schema});
