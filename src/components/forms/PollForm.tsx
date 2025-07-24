'use client'
import { useRouter } from "next/navigation"
import { useState, FormEvent} from "react"

const PollForm = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['','']);
    const [error, setError] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const router = useRouter();

    const handleOptionChange = (index : number, value : string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    }
    const addOption = () => {
        setOptions([...options , ''])
    }
    const removeOption = (index : number) => {
        if(options.length > 2){
            const newOptions = options.filter((_,i) => i !== index);
            setOptions(newOptions);
        }
    }
    const handleSubmit = async (e : FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if(!question.trim() || options.some(opt => !opt.trim())){
            setError("Please fill out the question and all option fields");
            setIsLoading(false);
            return;
        }
        try{
            const res = await fetch("/api/polls/create", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({question,options})
            })

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || "Failure in Creating Poll");
            }
            
            const data = await res.json();
            router.push(`/poll/${data.pollId}`);
        }
        catch(error: any){
            setError(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="mb-6">
        <label htmlFor="question" className="block mb-2 text-sm font-medium text-gray-900">
          Poll Question
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="What's your favorite color?"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-900">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder={`Option ${index + 1}`}
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="ml-2 text-red-500 hover:text-red-700 font-bold p-1"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4"
      >
        Add Option
      </button>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center disabled:bg-blue-400"
      >
        {isLoading ? 'Creating...' : 'Create Poll'}
      </button>
    </form>
    )
}

export default PollForm