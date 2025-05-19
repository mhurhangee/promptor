/**
 * Modal Utilities for Slack
 *
 * A unified system for managing Slack modals across different interaction types.
 * This module provides a registry for modal definitions and handles the complexities
 * of opening modals and processing submissions.
 */

import type { View } from '@slack/web-api'
import type {
  SlackBlockAction,
  SlackSelectStateValue,
  SlackShortcut,
  SlackViewStateValue,
  SlackViewSubmission,
} from '../interactions/types'
import { client } from './client'

// Types for modal definitions
export interface ModalDefinition {
  id: string
  getView: () => View
  handleSubmission?: SubmissionHandler<unknown>
  validationSchema?: ValidationSchema
}

export type ValidationSchema = Record<string, (value: unknown) => string | null>

export type SubmissionHandler<T> = (
  formValues: Record<string, Record<string, SlackViewStateValue | SlackSelectStateValue>>,
  userId: string,
  payload: SlackViewSubmission
) => Promise<T | SlackViewSubmissionResponse>

export interface SlackViewSubmissionResponse {
  response_action?: 'clear' | 'errors'
  errors?: Record<string, string>
}

/**
 * Modal registry to store all modal definitions and handle interactions
 */
class ModalRegistry {
  private modals: Map<string, ModalDefinition> = new Map()

  /**
   * Register a new modal
   * @param modal The modal definition to register
   */
  register(modal: ModalDefinition): void {
    this.modals.set(modal.id, modal)
    console.log(`Registered modal: ${modal.id}`)
  }

  /**
   * Get a modal by ID
   * @param id The modal ID
   */
  get(id: string): ModalDefinition | undefined {
    return this.modals.get(id)
  }

  /**
   * Get all registered modals
   */
  getAll(): ModalDefinition[] {
    return Array.from(this.modals.values())
  }

  /**
   * Open a modal by ID
   * @param id The modal ID
   * @param payload The Slack interaction payload
   */
  async openModal(id: string, payload: SlackShortcut | SlackBlockAction): Promise<boolean> {
    const modal = this.modals.get(id)
    if (!modal) {
      console.error(`Modal with ID ${id} not found`)
      return false
    }

    return this.showModal({
      triggerId: payload.trigger_id,
      view: modal.getView(),
      container: 'container' in payload ? payload.container : undefined,
    })
  }

  /**
   * Handle a modal submission by callback_id
   * @param payload The Slack view submission payload
   */
  async handleSubmission(
    payload: SlackViewSubmission
  ): Promise<SlackViewSubmissionResponse | undefined> {
    const callbackId = payload.view.callback_id
    const modal = this.modals.get(callbackId)

    if (!modal || !modal.handleSubmission) {
      console.error(`No submission handler found for modal with ID ${callbackId}`)
      return {
        response_action: 'errors',
        errors: {
          _error: 'No handler found for this form',
        },
      }
    }

    return this.processSubmission(modal, payload)
  }

  /**
   * Private helper method to show a modal
   */
  private async showModal({
    triggerId,
    view,
    container,
  }: {
    triggerId: string
    view: View
    container?: { type: string; view_id?: string }
  }): Promise<boolean> {
    try {
      // If we're in a modal already, push the new modal onto the stack
      if (container && container.type === 'view') {
        console.log(`Pushing modal onto stack with trigger_id: ${triggerId}`)
        await client.views.push({
          trigger_id: triggerId,
          view,
        })
      } else {
        // Otherwise open a new modal
        console.log(`Opening new modal with trigger_id: ${triggerId}`)
        await client.views.open({
          trigger_id: triggerId,
          view,
        })
      }
      return true
    } catch (error) {
      console.error('Error showing modal:', error)
      return false
    }
  }

  /**
   * Private helper method to process a submission
   */
  private async processSubmission(
    modal: ModalDefinition,
    payload: SlackViewSubmission
  ): Promise<SlackViewSubmissionResponse | undefined> {
    try {
      const formValues = payload.view.state.values
      const userId = payload.user.id

      // Run validation if schema is provided
      if (modal.validationSchema) {
        const errors: Record<string, string> = {}

        // Validate each field
        for (const [blockId, validator] of Object.entries(modal.validationSchema)) {
          const block = formValues[blockId]
          if (!block) continue

          const actionId = Object.keys(block)[0]
          if (!actionId) continue

          const value = block[actionId]
          const error = validator(value)

          if (error) {
            errors[blockId] = error
          }
        }

        // Return validation errors if any
        if (Object.keys(errors).length > 0) {
          return {
            response_action: 'errors',
            errors,
          }
        }
      }

      // Call the handler function
      if (!modal.handleSubmission) {
        return {}
      }

      const result = await modal.handleSubmission(formValues, userId, payload)

      // If the result is already a SlackViewSubmissionResponse, return it
      if (result && typeof result === 'object' && 'response_action' in result) {
        return result as SlackViewSubmissionResponse
      }

      // Otherwise return empty object to close the modal
      return {}
    } catch (error) {
      console.error('Error handling submission:', error)

      // Return a generic error
      return {
        response_action: 'errors',
        errors: {
          _error: 'An unexpected error occurred. Please try again.',
        },
      }
    }
  }
}

// Export a singleton instance
export const modals = new ModalRegistry()

// Helper function to extract action ID from a block action payload
export function getActionIdFromPayload(payload: SlackBlockAction): string | undefined {
  if (Array.isArray(payload.actions) && payload.actions.length > 0) {
    return payload.actions[0].action_id
  }
  return undefined
}

// Helper function to check if an action ID is a modal action
export function isModalAction(actionId: string): boolean {
  return actionId.startsWith('modal:')
}

// Helper function to extract modal ID from an action ID
export function getModalIdFromAction(actionId: string): string {
  return actionId.replace('modal:', '')
}
