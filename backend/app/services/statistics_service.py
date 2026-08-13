from typing import Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository
from app.repositories.response_repository import ResponseRepository
from app.models.enums import QuestionType


class StatisticsService:
    def __init__(self, db: Session):
        self.db = db
        self.form_repo = FormRepository(db)
        self.resp_repo = ResponseRepository(db)

    def calculate_form_statistics(self, form_id: str) -> Dict[str, Any]:
        form = self.form_repo.get_by_id(form_id)
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID '{form_id}' not found."
            )

        responses = self.resp_repo.get_form_responses(form_id)
        total_responses = len(responses)

        # Average completion time
        completion_times = [
            r.completion_time_seconds for r in responses if r.completion_time_seconds is not None
        ]
        avg_completion_seconds = (
            round(sum(completion_times) / len(completion_times), 1) if completion_times else 0
        )

        all_answers = self.resp_repo.get_answers_for_form(form_id)

        # Group answers by question_id
        answers_by_q: Dict[str, List] = {}
        for ans in all_answers:
            answers_by_q.setdefault(ans.question_id, []).append(ans)

        question_stats = []

        for q in form.questions:
            q_answers = answers_by_q.get(q.id, [])
            q_total_answers = len(q_answers)

            stat: Dict[str, Any] = {
                "question_id": q.id,
                "question_text": q.question_text,
                "type": q.type.value,
                "required": q.required,
                "total_answers": q_total_answers,
            }

            # 1. Choice Options / Dropdown / Yes-No Stats
            if q.type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
                option_counts: Dict[str, int] = {opt.label: 0 for opt in q.choice_options}
                # Track both label and value matching
                label_map = {opt.value: opt.label for opt in q.choice_options}

                for ans in q_answers:
                    val = ans.value_text or (str(ans.value_json) if ans.value_json else None)
                    if val:
                        # Match label directly or via value map
                        target_label = label_map.get(val, val)
                        if target_label in option_counts:
                            option_counts[target_label] += 1
                        else:
                            option_counts[target_label] = 1

                option_breakdown = []
                for label, count in option_counts.items():
                    pct = round((count / q_total_answers * 100), 1) if q_total_answers > 0 else 0.0
                    option_breakdown.append({
                        "label": label,
                        "count": count,
                        "percentage": pct
                    })
                stat["options"] = option_breakdown

            elif q.type == QuestionType.YES_NO:
                counts = {"Yes": 0, "No": 0}
                for ans in q_answers:
                    val = (ans.value_text or "").capitalize()
                    if val in counts:
                        counts[val] += 1
                
                option_breakdown = []
                for label, count in counts.items():
                    pct = round((count / q_total_answers * 100), 1) if q_total_answers > 0 else 0.0
                    option_breakdown.append({
                        "label": label,
                        "count": count,
                        "percentage": pct
                    })
                stat["options"] = option_breakdown

            # 2. Number Stats (Average, Min, Max)
            elif q.type == QuestionType.NUMBER:
                num_values = [ans.value_number for ans in q_answers if ans.value_number is not None]
                if num_values:
                    stat["summary"] = {
                        "avg": round(sum(num_values) / len(num_values), 2),
                        "min": min(num_values),
                        "max": max(num_values),
                        "count": len(num_values)
                    }
                else:
                    stat["summary"] = {"avg": 0, "min": 0, "max": 0, "count": 0}

            # 3. Rating Stats (Average score & distribution)
            elif q.type == QuestionType.RATING:
                rating_values = [ans.value_number for ans in q_answers if ans.value_number is not None]
                min_scale = (q.config or {}).get("min", 1)
                max_scale = (q.config or {}).get("max", 5)

                distribution: Dict[int, int] = {score: 0 for score in range(min_scale, max_scale + 1)}
                for r in rating_values:
                    int_r = int(r)
                    if int_r in distribution:
                        distribution[int_r] += 1

                avg_rating = (
                    round(sum(rating_values) / len(rating_values), 2) if rating_values else 0.0
                )

                dist_breakdown = []
                for score in range(min_scale, max_scale + 1):
                    cnt = distribution[score]
                    pct = round((cnt / len(rating_values) * 100), 1) if rating_values else 0.0
                    dist_breakdown.append({
                        "score": score,
                        "count": cnt,
                        "percentage": pct
                    })

                stat["summary"] = {
                    "average": avg_rating,
                    "min_scale": min_scale,
                    "max_scale": max_scale,
                    "total_ratings": len(rating_values),
                    "distribution": dist_breakdown
                }

            # 4. Text / Email Questions (Recent responses list)
            elif q.type in (QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT, QuestionType.EMAIL):
                recent_responses = [
                    ans.value_text for ans in q_answers if ans.value_text is not None and ans.value_text != ""
                ]
                stat["recent_responses"] = recent_responses[:10]  # top 10

            question_stats.append(stat)

        return {
            "form_id": form.id,
            "title": form.title,
            "slug": form.slug,
            "status": form.status,
            "total_responses": total_responses,
            "avg_completion_seconds": avg_completion_seconds,
            "question_stats": question_stats
        }
