import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import escalate from "./escalate.js";
import initialProcess from "../initialProcess.js";
import victory from "./victory.js";


const debate: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - tend to use CAPS for emphasis
      - Step by step logic
      - Be funny
      - be patronizing
      - try to educate with logic
      - faulty logic
      - MAX 5 sentences
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep

  //  // check mentalprocess to go to
  const shouldChill = await lastStep.compute(
    mentalQuery("The interlocuter agreed")
  )
  const shouldEscalate = await lastStep.compute(
    mentalQuery("The interlocuter disagreed")
  )
  const shouldVictory = await lastStep.compute(
    mentalQuery("The interlocuter avoided talking about the topic")
  )

    //////////////////////

  // go to mentalprocess
  log("User disagreed?", shouldEscalate)
  log("User agreed?", shouldChill)
  log("User trying to change topic?", shouldVictory)
  if(shouldEscalate){
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: WHAT?! I need to educate them with my HIGH LOGIC!
    `)
    setNextProcess(escalate)
    return finalStep
  } else if (shouldChill) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: I need to chill and stop shouting. I will stop using all caps.
    `)
    setNextProcess(initialProcess)
    return finalStep
  } else if (shouldVictory){
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: HA! He tries to avoid the topic! Another one bites the dust...
    `)
    setNextProcess(victory)
    return finalStep
  }

  return lastStep
}

export default debate
