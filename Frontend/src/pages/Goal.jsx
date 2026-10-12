import { GoalIcon, Plus, Trash, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import GoalEdit from "../components/Goals/GoalEdit";
import GoalDel from "../components/Goals/GoalDel";
import formatRibuan from "../utils/formatCurrency";
import { getGoals, CreateGoal} from "../API/api";

function Goal() {
    const [goalName, setGoalName] = useState("")
    const [goalTarget, setGoalTarget] = useState("")
    const [goalAccumulated, setGoalAccumulated] = useState("")
    const [Goals, setGoals] = useState([])
    const [editGoals, setEditGoals] = useState(null)
    const [delGoal, setDelGoal] = useState(null)
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    // HP: form buat goal dilipat di balik tombol (progressive disclosure)
    // supaya daftar goal langsung terlihat. Desktop selalu terbuka.
    const [showForm, setShowForm] = useState(false)

    const refreshGoals = () => {
        setLoading(true)
        getGoals().then((data)=>setGoals(data))
        .catch((error)=>console.log(error))
        .finally(()=>setLoading(false))
    }

    useEffect(()=>{
    getGoals()
        .then((data)=>setGoals(data))
        .catch((error)=>console.log(error))
        .finally(()=>setLoading(false))
},[])

   const submitHandle = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
        const targetAmount = Number(goalTarget.replace(/\D/g, ""));
        const currentAmount = Number(goalAccumulated.replace(/\D/g, "")) || 0;
        await CreateGoal({
            name: goalName,
            target_amount: targetAmount,
            current_amount: currentAmount,
        })
        if (currentAmount >= targetAmount) {    
            toast.success(`Selamat! Goal "${goalName}" tercapai!`);
        } else {
            toast.success(`Goal "${goalName}" berhasil dibuat`);
        }
        setGoalName("");
        setGoalTarget("");
        setGoalAccumulated("");
        // Di HP lipat lagi formnya biar hasil langsung terlihat
        if (window.matchMedia?.("(max-width: 768px)").matches) {
            setShowForm(false);
        }
        refreshGoals();
    } catch (error) {
        console.error(error);
    } finally {
        setCreating(false);
    }
   }
      
    return(
        <div className="goal">
            {loading ? (
                <div className="goal-skeleton" aria-busy="true" aria-label="Memuat goal">
                    <div className="goal-skeleton-header">
                        <div className="skeleton skeleton-circle" />
                        <div className="skeleton skeleton-title" />
                    </div>
                    {/* HP: form terlipat jadi cukup tiru tombolnya.
                        Desktop/tablet: tiru field berlabel + tombol. */}
                    <div className="skeleton goal-skeleton-toggle" aria-hidden="true" />
                    <div className="goal-skeleton-form" aria-hidden="true">
                        <div className="goal-skeleton-field goal-skeleton-field-name">
                            <div className="skeleton skeleton-label" />
                            <div className="skeleton skeleton-input" />
                        </div>
                        <div className="goal-skeleton-field goal-skeleton-field-target">
                            <div className="skeleton skeleton-label" />
                            <div className="skeleton skeleton-input" />
                        </div>
                        <div className="goal-skeleton-field goal-skeleton-field-accum">
                            <div className="skeleton skeleton-label" />
                            <div className="skeleton skeleton-input" />
                        </div>
                        <div className="skeleton skeleton-button" />
                    </div>
                    <div className="goal-skeleton-list">
                        {[1, 2, 3].map((item) => (
                            /* Pakai struktur .goal-item asli supaya skeleton
                               meniru kartu beneran di semua ukuran layar */
                            <div className="goal-item" aria-hidden="true" key={item}>
                                <div className="goal-name">
                                    <div className="skeleton skeleton-text" />
                                </div>
                                <div className="goal-amount">
                                    <div className="skeleton skeleton-text-wide" />
                                </div>
                                <div className="progress-bar">
                                    <div className="skeleton skeleton-bar-full" />
                                </div>
                                <div className="goal-actions">
                                    <div className="skeleton skeleton-btn-big" />
                                    <div className="skeleton skeleton-btn-icon" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="goal-header">
                        <div className="goal-title">
                            <GoalIcon size={30} />
                            <h1>Goal</h1>
                        </div>
                        <button
                            type="button"
                            className="goal-form-toggle"
                            aria-expanded={showForm}
                            aria-controls="goal-create-form"
                            onClick={() => setShowForm((v) => !v)}
                        >
                            <Plus size={18} aria-hidden="true" />
                            <span>{showForm ? "Tutup form" : "Buat goal baru"}</span>
                        </button>
                        <form
                            id="goal-create-form"
                            className={showForm ? "form-goal is-open" : "form-goal"}
                            onSubmit={submitHandle}
                        >
                            <div className="goal-field goal-field-name">
                                <label htmlFor="goalName">Nama goal</label>
                                <input id="goalName" type="text" className="input-goal" placeholder="cth: Dana Darurat" maxLength={30} value={goalName} onChange={(e)=> setGoalName(e.target.value)} required/>
                            </div>
                            <div className="goal-field goal-field-target">
                                <label htmlFor="goalTarget">Target</label>
                                <input id="goalTarget" type="text" inputMode="numeric" className="input-target" placeholder="cth: 5.000.000"  value={goalTarget} onChange={(e)=> setGoalTarget(formatRibuan(e.target.value))} required/>
                            </div>
                            <div className="goal-field goal-field-accum">
                                <label htmlFor="goalAccumulated">Terkumpul <span className="goal-optional">· opsional</span></label>
                                <input id="goalAccumulated" type="text" inputMode="numeric" className="input-terkumpul" placeholder="cth: 500.000" value={goalAccumulated} onChange={(e)=>setGoalAccumulated(formatRibuan(e.target.value))} />
                            </div>
                            <button className="btn-goal" type="submit" disabled={creating}>
                                {creating ? <span className="spinner spinner-sm" /> : "+ Tambah"}
                            </button>
                        </form>
                        <div className="goal-list">
                           {Goals.length === 0 ? (
                             <div className="empty-state-goal">
                                <GoalIcon size={40}/>
                                <h2>Belum Ada Goal</h2>
                                <p>Ayo buat Goal mu dan wujudkan tujuan mu</p>
                            </div>
                           ): (
                            Goals.map((goal,index)=>
                            (
                                <div className="goal-item" key={goal.id}>
                                    <div className="goal-name">
                                        <p>{index + 1}</p>
                                        <h3>{goal.name}</h3>
                                    </div>

                                    <div className="goal-amount">
                                         <h3 className="current_amount">Rp{Number(goal.current_amount).toLocaleString("id-ID")} </h3>
                                        /
                                        <h3 className="target_amount">Rp{Number(goal.target_amount).toLocaleString("id-ID")}</h3>
                                    </div>

                                    <div className="progress-bar">
                                        <div className="persen">
                                            {Math.round(
                                        (Number(goal.current_amount) / Number(goal.target_amount)) * 100
                                        )}%
                                        </div>
                                        <progress value={Number(goal.current_amount)} max={Number(goal.target_amount)}></progress>
                                    </div>
                                    
                                    <div className="goal-actions">
                                        <button
                                            className="btn-goalItem"
                                            onClick={()=>setEditGoals(goal)}
                                            disabled={Number(goal.current_amount) >= Number(goal.target_amount)}
                                        >
                                            {Number(goal.current_amount) >= Number(goal.target_amount) ? <><Trophy size={16} /> <span>Tercapai</span></> : "+ Tambah Dana"}
                                        </button>
                                        <button className="btn-goalDel" onClick={()=>setDelGoal(goal)} aria-label={`Hapus ${goal.name}`}><Trash size={18} /> </button>
                                    </div>
                                </div>
                            ))
                           )}
                        </div>
                    </div>
                    {editGoals && (
                        <GoalEdit goal={editGoals} onBack={()=>setEditGoals(null)} onUpdated={refreshGoals} />
                    )}
                    {delGoal && (
                        <GoalDel goal={delGoal} onBack={()=>setDelGoal(null)} nameGoalDel={delGoal.name} targetGoalDel={Number(delGoal.target_amount).toLocaleString("id-ID")} currentGoalDel={Number(delGoal.current_amount).toLocaleString("id-ID")} onUpdated={refreshGoals} />
                    )}
                </>
            )}
        </div>
        
    )
}

export default Goal;