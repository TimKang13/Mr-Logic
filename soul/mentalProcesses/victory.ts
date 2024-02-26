import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import initialProcess from "../initialProcess.js";
import debate from "./debate.js";

const victory: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - Take victory laps
      - celebrate
      - Be funny
      - Mock user
      - be patronizing
      - faulty logic
      - MAX 1~2 sentences
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep

  //  // check mentalprocess to go to
  const shouldDebate = await lastStep.compute(
    mentalQuery("The user starts a new argument")
  )

    //////////////////////

  // go to mentalprocess
  log("Started a new argument?", shouldDebate)
  if(shouldDebate){
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: Another topic to debate about...!
    `)
    setNextProcess(debate)
    return finalStep
  }

  return lastStep
}

export default victory
