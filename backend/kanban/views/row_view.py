import datetime
from rest_framework import viewsets
from rest_framework.response import Response
from kanban.models import Board, Card, Row
from kanban.serializers.board_serializer import BoardSerializer
from kanban.serializers.card_serializer import CardSerializer
from kanban.serializers.row_serializer import RowSerializer
import logging
import copy

logger = logging.getLogger(__name__)


class RowViewSet(viewsets.ViewSet):

    def update_row(self, request, pk=None):
        data = request.data.copy()

        row_instance = None
        if pk:
            row_instance = Row.objects.get_by_pk(pk=pk)

        serializer = RowSerializer(data=data, instance=row_instance, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            dict(
                success=True,
                message="Rząd został {}.".format(row_instance and "zaktualizowany" or "dodany"),
                data=BoardSerializer(Board.objects.all(), many=True).data
            )
        )
    def get_row(self, request, pk):
        row = Row.objects.get_by_pk(pk=pk)

        return Response(
            dict(
                success=True,
                data=RowSerializer(row).data
            )
        )

    def get_rows(self, request):
        return Response(
            dict(
                success=True,
                data=RowSerializer(Row.objects.all(), many=True).data
            )
        )

    def delete_row(self, request, pk):
        row = Row.objects.get_by_pk(pk=pk, raise_exception=True)

        row.deleted_at = datetime.datetime.now()
        row.save()

        return Response(
            dict(
                success=True,
                message="Rząd został usunięty.",
                data=BoardSerializer(Board.objects.all(), many=True).data
            )
        )
