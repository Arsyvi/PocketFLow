import logo from "../../assets/favicon.png"
import { CirclePlus, ArrowDownCircle } from "lucide-react";
function Header({totalAmount, onOpenIncome, onOpenExpense}) {
    return(
        <header className="header">
            <div className="brand">
                <img src={logo} alt="pocketflow" className="logo" />
                 <h1 className="title">Pocket<span>Flow</span></h1>
            </div>
           
            <h2 className="total-amount">
                Rp{totalAmount.toLocaleString("id-ID")}
            </h2>
            <div className="btn-header">
                <button className="btn-pemasukan" onClick={onOpenIncome}>
                <CirclePlus /> Pemasukan
                </button>

                <button className="btn-pengeluaran" onClick={onOpenExpense}>
                    <ArrowDownCircle /> Pengeluaran
                </button>
            </div>
        </header>
    )
}

export default Header;