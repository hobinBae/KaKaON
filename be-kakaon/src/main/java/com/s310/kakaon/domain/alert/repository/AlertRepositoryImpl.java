package com.s310.kakaon.domain.alert.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.alert.dto.AlertSearchRequestDto;
import com.s310.kakaon.domain.alert.dto.UnreadCountProjection;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.alert.entity.QAlert;
import com.s310.kakaon.domain.store.entity.Store;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@AllArgsConstructor
public class AlertRepositoryImpl implements AlertRepositoryCustom{

    private final JPAQueryFactory jpaQueryFactory;
    private final QAlert alert = QAlert.alert;

    @Override
    public Page<Alert> searchAlerts(Store store, AlertSearchRequestDto request, Pageable pageable) {

        List<Alert> content = jpaQueryFactory
                .selectFrom(alert)
                .where(
                        storeEq(store),
                        goeStartDate(request.getStartDate()),
                        ltEndDate(request.getEndDate()),
                        alertTypeEq(request.getAlertType()),
                        checkedEq(request.getChecked())
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(alert.detectedAt.desc())
                .fetch()
                ;
        JPAQuery<Long> countQuery = jpaQueryFactory
                .select(alert.count())
                .from(alert)
                .where(
                        storeEq(store),
                        goeStartDate(request.getStartDate()),
                        ltEndDate(request.getEndDate()),
                        alertTypeEq(request.getAlertType()),
                        checkedEq(request.getChecked())
                );
        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public List<UnreadCountProjection> countUnreadByMemberIdGroupedByStore(Long memberId) {
        QAlert alert = QAlert.alert;

        return jpaQueryFactory
                .select(Projections.constructor(
                        UnreadCountProjection.class,
                        alert.store.id,
                        alert.count()
                ))
                .from(alert)
                .where(
                        alert.checked.eq(false),
                        alert.store.member.id.eq(memberId)
                )
                .groupBy(alert.store.id)
                .fetch();
    }


    private BooleanExpression storeEq(Store store){
        return alert.store.eq(store);
    }

    private BooleanExpression goeStartDate(LocalDate startDate){
        if(startDate == null){
            return null;
        }
        return alert.detectedAt.goe(startDate.atStartOfDay());
    }

    private BooleanExpression ltEndDate(LocalDate endDate){
        if(endDate == null){
            return null;
        }
        return alert.detectedAt.lt(endDate.plusDays(1).atStartOfDay());
    }

    private BooleanExpression alertTypeEq(AlertType alertType){
        if(alertType == null){
            return null;
        }
        return alert.alertType.eq(alertType);
    }

    private BooleanExpression checkedEq(Boolean checked){
        if(checked == null){
            return null;
        }

        return alert.checked.eq(checked);
    }

    @Override
    public Long countUnreadByStore(Store store) {
        QAlert alert = QAlert.alert;

        Long count = jpaQueryFactory
                .select(alert.count())
                .from(alert)
                .where(
                        alert.store.eq(store),
                        alert.checked.eq(false)
                )
                .fetchOne();

        return count != null ? count : 0L;
    }


}
