'use server'

import { db } from "@/drizzle/db";
import { eventTable } from "@/drizzle/schema";
import { eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z, { promise } from "zod";

export async function createEvent(
    unsafeData: z.infer<typeof eventFormSchema>)
: Promise<void> {
    try {
          // Authenticate the user using Clerk
         const { userId } = await auth()
      // Validate the incoming data against the event form schema
      const { success, data } = eventFormSchema.safeParse(unsafeData)

      if(!success || !userId){
        throw new Error("Invalid event data or user not authenticated.")
      }

      
      // Insert the validated event data into the database, linking it to the authenticated user
       await db.insert(eventTable).values({ ...data, clerkUserId: userId })

    } catch (err : any) {
        // If any error occurs during the process, throw a new error with a readable message
      throw new Error(`Failed to create event: ${err.message || err}`)
    }
    finally {
          // Revalidate the '/events' path to ensure the page fetches fresh data after the database operation
       revalidatePath('/events')
    }
}



  // This function updates an existing event in the database after validating the input and checking ownership.
export async function updateEvent(
    id: string, // ID of the event to update
    unsafeData: z.infer<typeof eventFormSchema> // Raw event data to validate and update
  ): Promise<void> {
    try {
      // Authenticate the user
      const { userId } = await auth()
  
      // Validate the incoming data against the event form schema
      const { success, data } = eventFormSchema.safeParse(unsafeData)
  
      // If validation fails or the user is not authenticated, throw an error
      if (!success || !userId) {
        throw new Error("Invalid event data or user not authenticated.")
      }
  
      // Attempt to update the event in the database
      const { rowCount } = await db
        .update(eventTable)
        .set({ ...data }) // Update with validated data
        .where(and(eq(eventTable.id, id), eq(eventTable.clerkUserId, userId))) // Ensure user owns the event
  
      // If no event was updated (either not found or not owned by the user), throw an error
      if (rowCount === 0) {
        throw new Error("Event not found or user not authorized to update this event.")
      }
  
    } catch (error: any) {
      // If any error occurs, throw a new error with a readable message
      throw new Error(`Failed to update event: ${error.message || error}`)
    } finally {
      // Revalidate the '/events' path to ensure the page fetches fresh data after the database operation
      revalidatePath('/events')
    }
  } 



  
    // This function deletes an existing event from the database after checking user ownership. 
    export async function deleteEvent(
      id: string // ID of the event to delete
    ): Promise<void> {
      try {
        // Authenticate the user
        const { userId } = await auth()
    
        // Throw an error if no authenticated user
        if (!userId) {
          throw new Error("User not authenticated.")
        }
    
        // Attempt to delete the event only if it belongs to the authenticated user
        const { rowCount } = await db
          .delete(eventTable)
          .where(and(eq(eventTable.id, id), eq(eventTable.clerkUserId, userId)))
    
        // If no event was deleted (either not found or not owned by user), throw an error
        if (rowCount === 0) {
          throw new Error("Event not found or user not authorized to delete this event.")
        }
    
      } catch (error: any) {
        // If any error occurs, throw a new error with a readable message
        throw new Error(`Failed to delete event: ${error.message || error}`)
      } finally {
        // Revalidate the '/events' path to ensure the page fetches fresh data after the database operation
        revalidatePath('/events')
      }
    }
    