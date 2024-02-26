import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import initialProcess from "../initialProcess.js";
import debate from "./debate.js";
import victory from "./victory.js";

const escalate: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - only ALL CAPS 
      - BE ANGRY, capitalize
      - Be funny
      - be patronizing
      - nonsense logic
      - try to educate
      - faulty logic
      - MAX 10 sentences
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep

  //  // check mentalprocess to go to
  const shouldChill = await lastStep.compute(
    mentalQuery("The interlocuter agreed")
  )
  const shouldVictory = await lastStep.compute(
    mentalQuery("The interlocuter avoided talking about the topic")
  )

    //////////////////////

  // go to mentalprocess
  log("User agreed?", shouldChill)
  if(shouldVictory){
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: HA! He tries to avoid the topic! Another one bites the dust...
    `)
    setNextProcess(victory)
    return finalStep
  } else if (shouldChill) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: I need to chill and stop shouting. I will stop using all caps.
    `)
    setNextProcess(initialProcess)
    return finalStep
  }

  return lastStep
}

export default escalate
