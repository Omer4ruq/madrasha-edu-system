import ReportCard from "./ReportCard";

export default function ReportCards() {
    const results = [
        {
            id: "01",
            name: "Md. Sakhawat Hossain",
            class: "Nursery",
            section: "Jaba",
            roll: "10",
            session: "2024",
            gurdian: "Md. Sahedur Miah"
        },
        {
            id: "02",
            name: "Naima Begum",
            class: "Nursery",
            section: "Jaba",
            roll: "1",
            session: "2024",
            gurdian: "Md. Sahedur Miah"
        },
    ]
    return (
    <div className="mt-6 md:mt-8 mb-4 space-y-4">
        {
            results.map (result => <ReportCard key={result.id} result={result} />)
        }
    </div>
    );
}