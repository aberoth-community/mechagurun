import BaseEvent from './BaseEvent'
import type MechaGurun from 'src/MechaGurun'
import type { Interaction } from 'discord.js'

/**
 * Interaction create event
 * @class
 */
export default class InteractionEvent extends BaseEvent {
  runTask: undefined

  constructor(gurun: MechaGurun) {
    super(gurun, 'interactionCreate')
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      this.gurun.handleCommand(interaction.commandName, [interaction])
    }
  }
}
