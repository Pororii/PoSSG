import React from 'react';

interface InputFormProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    placeholder?: string;
}

const InputForm: React.FC<InputFormProps> = ({ value, onChange, onSubmit, placeholder }) => {
    return (
        <form onSubmit={onSubmit}>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="bg-gray-100 border border-gray-300 text-xs font-PretendardVariable font-normal rounded-md px-3 py-2 mr-3"
            />
            <button
                type="submit"
                className="bg-blue-600 text-white text-xs font-PretendardVariable font-normal rounded-md py-2 px-5 mr-3 transition duration-200 ease-in-out cursor-pointer">
                폴더생성
            </button>
        </form>
    );
};

export default InputForm;