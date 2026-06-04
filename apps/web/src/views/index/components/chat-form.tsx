import { useRHForm, FormProvider } from '@/hooks/use-form'
import { ChatSchemaInterface, chatSchema } from '@/schemas/chat.schema'
import InputWithValidation from '@/components/form/input-with-validation'
import { icons } from '@/utils/icons'

const SendIcon = icons.send

interface ChatFormProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading?: boolean
}

const ChatForm = ({ onSendMessage, isLoading = false }: ChatFormProps) => {
  const methods = useRHForm(chatSchema)

  const handleSubmit = async (data: ChatSchemaInterface) => {
    if (isLoading || !data.message.trim()) return
    methods.reset()
    await onSendMessage(data.message)
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-focus-within:opacity-100 blur group-focus-within:blur-sm transition-all duration-500 animate-gradient-rotate" />
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-3xl opacity-0 group-focus-within:opacity-75 blur-xl transition-opacity duration-500" />

        <div className="relative flex items-center bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
          <button
            type="button"
            className="flex items-center justify-between mx-4 text-gray-500 hover:text-blue-400 transition-all duration-300 hover:scale-110"
            aria-label="Adjuntar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <div className="w-full h-full">
            <InputWithValidation
              name="message"
              placeholder="Pregunta lo que quieras..."
              disabled={isLoading}
              autoComplete="off"
              autoFocus
              inputClassName="border-none bg-transparent text-white placeholder:text-gray-500 focus:placeholder:text-gray-600 py-4"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center p-2.5  mr-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group/btn"
            aria-label="Enviar"
          >
            <div className="transition-transform duration-200">
              <SendIcon className="size-4" />
            </div>
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ChatForm
