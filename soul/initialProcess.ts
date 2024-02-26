import { externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import debate from "./mentalProcesses/debate.js"

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Talk to the user trying to gain trust and learn about their inner world."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep

  // check mentalprocess to go to
  const shouldDebate = await lastStep.compute(
    mentalQuery("Engaged in a heated argument?")
  )

  //////////////////////

  // go to mentalprocess
  log("Engaged in an argument?", shouldDebate)
  if (shouldDebate) {
    setNextProcess(debate)
  }

  return lastStep
}

export default gainsTrustWithTheUser
