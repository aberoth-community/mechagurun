import Event from './BaseEvent'

import type MechaGurun from 'src/MechaGurun'
import type { Interaction } from 'discord.js'

export default class InteractionEvent extends Event {
  constructor(gurun: MechaGurun) {
    super(gurun, 'interactionCreate')
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      this.gurun.handleCommand(interaction.commandName, interaction)
    }
  }
}
