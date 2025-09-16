import { ToastContainer as ToastContainerComponent } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer = () => {
    return (
        <ToastContainerComponent position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover
            toastClassName={(context) =>
                context?.type === "success"
                    ? "z-50 bg-green-500 text-white font-poppins rounded-lg text-center px-6 py-3 w-[300px] text-sm font-bold flex items-center justify-center shadow-lg"
                    : context?.type === "error"
                        ? "z-50 bg-red-500 text-white font-poppins rounded-lg text-center px-6 py-3 w-[300px] text-sm font-bold flex items-center justify-center shadow-lg"
                        : context?.type === "warning"
                            ? "z-50 bg-yellow-500 text-white font-poppins rounded-lg text-center px-6 py-3 w-[300px] text-sm font-bold flex items-center justify-center shadow-lg"
                            : undefined
            }
        />
    );
};

export default ToastContainer;